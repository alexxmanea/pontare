import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import https from "https";
import moment from "moment";
import path from "path";
import { exit } from "process";
import {
    ADD_TO_TIMESHEET_DELAY,
    DATE_FORMATS,
    DAY_TYPES,
    SERVER_ERROR,
} from "./Constants.js";
import {
    changeDefaultVacationDays,
    changeEmail,
    changeSlackMemberId,
    checkUserCredentials,
    getDailyTasks,
    getTeamMembers,
    getUserData,
    getUsers,
    insertUser,
    markDailyTask,
    toggleAutomaticTimesheet,
    toggleEmailSubscription,
    toggleSlackSubscription,
    updateUser,
} from "./Firebase.js";
import {
    addToTimesheet,
    checkValidTimesheetCredentials,
    closeBrowser,
    getRemoteTimesheetPageContent,
    startPageAndLogin,
} from "./Timesheet.js";
import { delay } from "./Utils.js";

const REST_PROTOCOL = "https";
const REST_ADDRESS = "pontare.go.ro";
const REST_PORT = "443";
const REST_URL = `${REST_PROTOCOL}://${REST_ADDRESS}`;

const SSL_CERT_PATH = "secure/certificates/certificate.pem";
const SSL_KEY_PATH = "secure/certificates/key.pem";

const SERVER_STARTED_MESSAGE = `${REST_PROTOCOL.toUpperCase()} server listening on ${REST_URL}`;

const INVALID_CREDENTIALS = "invalid_credentials";
const INVALID_TIMESHEET_CREDENTIALS = "invalid_timesheet_credentials";
const USER_EXISTS = "user_exists";

export const createServer = () => {
    let httpServer = express();
    addServerOptions(httpServer);

    return httpServer;
};

const getSslCredentials = () => {
    const projectPath = path.resolve(path.dirname(""));
    const sslCertPath = path.join(projectPath, SSL_CERT_PATH);
    const sslCert = fs.readFileSync(sslCertPath, "utf8");

    const sslKeyPath = path.join(projectPath, SSL_KEY_PATH);
    const sslKey = fs.readFileSync(sslKeyPath, "utf8");
    const sslCredentials = { cert: sslCert, key: sslKey };

    return sslCredentials;
};

const addServerOptions = (httpServer) => {
    httpServer.use(bodyParser.json());

    httpServer.use(
        express.static(path.join(process.cwd(), "frontend-build"))
    );
};

export const startServer = (httpServer, firebaseDatabase) => {
    httpServer.post("/api/login", async (request, response) => {
        const username = request.body.username;
        const password = request.body.password;

        const userId = await checkUserCredentials(
            firebaseDatabase,
            username,
            password
        );

        if (userId === null) {
            response.send(INVALID_CREDENTIALS);
            return;
        }

        response.send(userId);
    });

    httpServer.post("/api/register", async (request, response) => {
        const username = request.body.username;
        const password = request.body.password;
        const email = request.body.email;

        if (!(await checkValidTimesheetCredentials(username, password))) {
            response.send(INVALID_TIMESHEET_CREDENTIALS);
            return;
        }

        const couldInsertUser = await insertUser(
            firebaseDatabase,
            username,
            password,
            email
        );

        if (!couldInsertUser) {
            response.send(USER_EXISTS);
            return;
        }

        response.end();
    });

    httpServer.post("/api/submittimesheet", async (request, response) => {
        const timesheet = request?.body?.timesheet;
        const userId = request?.body?.userId;
        const workingHours = request?.body?.workingHours || 8;

        if (!timesheet || !timesheet?.length) {
            response.send(SERVER_ERROR);
            return;
        }

        const data = await getUserData(firebaseDatabase, userId);

        const { page, browser, retCode } = await startPageAndLogin(
            data.username,
            data.password
        );

        if (!retCode) {
            response.send(SERVER_ERROR);
            return;
        }

        const remoteTimesheetPageContent = await getRemoteTimesheetPageContent(
            page
        );

        let vacationDaysAdded = 0;
        let workDaysAdded = 0;
        let timesheetHistory = [];
        let nextVacation = [];

        for (let i = 0; i < timesheet.length; i++) {
            const entry = timesheet[i];
            let interval = [...entry.interval];
            if (interval.length === 1) {
                interval.push(interval[0]);
            }

            const startingDay = moment(interval[0], DATE_FORMATS.default);
            const endingDay = moment(interval[1], DATE_FORMATS.default);

            const timesheetEntry = {
                startingDay: startingDay.format(DATE_FORMATS.default),
                endingDay: endingDay.format(DATE_FORMATS.default),
                daysUsed: 0,
                type: entry.type,
            };

            if (
                startingDay.format(DATE_FORMATS.default) ===
                endingDay.format(DATE_FORMATS.default)
            ) {
                timesheetEntry.endingDay = null;
            }

            for (
                let currentMoment = moment(startingDay);
                currentMoment.diff(endingDay, "days") <= 0;
                currentMoment.add(1, "days")
            ) {
                const wasAdded = await addToTimesheet(
                    page,
                    remoteTimesheetPageContent,
                    currentMoment,
                    workingHours,
                    entry.type
                );

                if (wasAdded) {
                    timesheetEntry.daysUsed++;
                }

                await delay(ADD_TO_TIMESHEET_DELAY);
            }

            if (entry.type === DAY_TYPES.workday) {
                workDaysAdded += timesheetEntry.daysUsed;
            } else {
                vacationDaysAdded += timesheetEntry.daysUsed;
                nextVacation.push({
                    startingDay: timesheetEntry.startingDay,
                    endingDay: timesheetEntry.endingDay,
                });
            }

            timesheetHistory.push(timesheetEntry);
        }

        data.vacationDaysAdded += vacationDaysAdded;
        data.workDaysAdded += workDaysAdded;
        data.timesheetHistory = [...data.timesheetHistory, ...timesheetHistory];
        data.nextVacation = [...data.nextVacation, ...nextVacation];

        delete data.password;

        await updateUser(firebaseDatabase, userId, data);

        await closeBrowser(browser);

        // await sendEmailNotification(
        //     data,
        //     composeEmailManualTimesheetMessage(timesheetHistory)
        // );

        // await sendSlackNotification(
        //     data,
        //     composeSlackTimesheetMessage(timesheetHistory, data.slackMemberId)
        // );

        response.end();
    });

    httpServer.get("/api/automatictimesheet", async (request, response) => {
        const userId = request?.query?.userId;

        if (!userId || !userId?.length) {
            response.send(SERVER_ERROR);
            return;
        }

        const data = await getUserData(firebaseDatabase, userId);

        const responseBody = {
            automaticTimesheetSubscription: data.automaticTimesheetSubscription,
        };

        response.send(responseBody);
        response.end();
    });

    httpServer.get("/api/emailnotifications", async (request, response) => {
        const userId = request?.query?.userId;

        if (!userId || !userId?.length) {
            response.send(SERVER_ERROR);
            return;
        }

        const data = await getUserData(firebaseDatabase, userId);

        const responseBody = {
            email: data.email,
            emailSubscription: data.emailSubscription,
        };

        response.send(responseBody);
        response.end();
    });

    httpServer.get("/api/slacknotifications", async (request, response) => {
        const userId = request?.query?.userId;

        if (!userId || !userId?.length) {
            response.send(SERVER_ERROR);
            return;
        }

        const data = await getUserData(firebaseDatabase, userId);

        const responseBody = {
            slackMemberId: data.slackMemberId,
            slackSubscription: data.slackSubscription,
        };

        response.send(responseBody);
        response.end();
    });

    httpServer.post("/api/automatictimesheet", async (request, response) => {
        const userId = request?.body?.userId;
        const automaticTimesheetSubscription =
            request?.body?.automaticTimesheetSubscription;

        if (
            userId === undefined ||
            automaticTimesheetSubscription === undefined
        ) {
            response.send(SERVER_ERROR);
            return;
        }

        await toggleAutomaticTimesheet(
            firebaseDatabase,
            userId,
            automaticTimesheetSubscription
        );

        response.end();
    });

    httpServer.post("/api/emailsubscription", async (request, response) => {
        const userId = request?.body?.userId;
        const emailSubscription = request?.body?.emailSubscription;

        if (userId === undefined || emailSubscription === undefined) {
            response.send(SERVER_ERROR);
            return;
        }

        await toggleEmailSubscription(
            firebaseDatabase,
            userId,
            emailSubscription
        );

        response.end();
    });

    httpServer.post("/api/slacksubscription", async (request, response) => {
        const userId = request?.body?.userId;
        const slackSubscription = request?.body?.slackSubscription;

        if (userId === undefined || slackSubscription === undefined) {
            response.send(SERVER_ERROR);
            return;
        }

        await toggleSlackSubscription(
            firebaseDatabase,
            userId,
            slackSubscription
        );

        response.end();
    });

    httpServer.post("/api/changeemail", async (request, response) => {
        const userId = request?.body?.userId;
        const email = request?.body?.email;

        if (userId === undefined || email === undefined) {
            response.send(SERVER_ERROR);
            return;
        }

        await changeEmail(firebaseDatabase, userId, email);

        response.end();
    });

    httpServer.post("/api/changeslackmemberid", async (request, response) => {
        const userId = request?.body?.userId;
        const slackMemberId = request?.body?.slackMemberId;

        if (userId === undefined || slackMemberId === undefined) {
            response.send(SERVER_ERROR);
            return;
        }

        await changeSlackMemberId(firebaseDatabase, userId, slackMemberId);

        response.end();
    });

    httpServer.get("/api/timesheethistory", async (request, response) => {
        const userId = request?.query?.userId;

        if (!userId || !userId?.length) {
            response.send(SERVER_ERROR);
            return;
        }

        const data = await getUserData(firebaseDatabase, userId);

        const responseBody = {
            timesheetHistory: data.timesheetHistory,
        };

        response.send(responseBody);
        response.end();
    });

    httpServer.get("/api/stats", async (request, response) => {
        const userId = request?.query?.userId;

        if (!userId || !userId?.length) {
            response.send(SERVER_ERROR);
            return;
        }

        const data = await getUserData(firebaseDatabase, userId);

        const responseBody = {
            workDaysAdded: data.workDaysAdded,
            vacationDaysAdded: data.vacationDaysAdded,
            defaultVacationDays: data.defaultVacationDays,
            nextVacation: data?.nextVacation?.length
                ? data.nextVacation[0]
                : null,
        };

        response.send(responseBody);
        response.end();
    });

    httpServer.post(
        "/api/changedefaultvacationdays",
        async (request, response) => {
            const userId = request?.body?.userId;
            const defaultVacationDays = request?.body?.defaultVacationDays;

            if (userId === undefined || defaultVacationDays === undefined) {
                response.send(SERVER_ERROR);
                return;
            }

            await changeDefaultVacationDays(
                firebaseDatabase,
                userId,
                defaultVacationDays
            );

            response.end();
        }
    );

    httpServer.get("/api/team", async (request, response) => {
        const userId = request?.query?.userId;

        if (!userId || !userId?.length) {
            response.send(SERVER_ERROR);
            return;
        }

        const userData = await getUserData(firebaseDatabase, userId);
        const teamMembers = await getTeamMembers(
            firebaseDatabase,
            userData.team
        );
        const allUsers = await getUsers(firebaseDatabase);

        let team = {};
        teamMembers.forEach((email) => {
            team[email] = { email: email, isRegistered: false };
        });

        allUsers.forEach((entry) => {
            const user = entry.data();

            if (user.team === userData.team) {
                team[user.email].isRegistered = true;
                team[user.email].username = user.username;
                team[user.email].nextVacation = user.nextVacation?.length
                    ? user.nextVacation[0]
                    : null;
            }
        });

        const responseBody = {
            team: Object.values(team),
        };

        response.send(responseBody);
        response.end();
    });

    return https
        .createServer(getSslCredentials(), httpServer)
        .listen(REST_PORT, () => {
            console.log(SERVER_STARTED_MESSAGE);
        });
};

export const runDailyTask = async (database) => {
    const tasks = await getDailyTasks(database);

    const currentMoment = moment();

    let taskFound = false;
    tasks.forEach((task) => {
        if (task === currentMoment.format(DATE_FORMATS.default)) {
            taskFound = true;
        }
    });

    if (taskFound) {
        console.log("Task already done.");
        return;
    }

    const snapshot = await getUsers(database);

    const timesheetEntry = {
        startingDay: currentMoment.format(DATE_FORMATS.default),
        endingDay: null,
        daysUsed: 0,
        type: DAY_TYPES.workday,
    };

    let subscribedUsersData = [];

    snapshot.forEach((entry) => {
        const data = entry.data();

        if (data.automaticTimesheetSubscription) {
            subscribedUsersData.push({ data: data, id: entry.id });
        }
    });

    for (let i = 0; i < subscribedUsersData.length; i++) {
        const { page, browser, retCode } = await startPageAndLogin(
            subscribedUsersData[i].data.username,
            subscribedUsersData[i].data.password
        );

        if (!retCode) {
            exit(0);
        }

        const remoteTimesheetPageContent = await getRemoteTimesheetPageContent(
            page
        );

        const wasAdded = await addToTimesheet(
            page,
            remoteTimesheetPageContent,
            currentMoment,
            8,
            DAY_TYPES.workday
        );

        await closeBrowser(browser);

        if (wasAdded) {
            let timesheetHistory = [];
            timesheetHistory.push(timesheetEntry);

            subscribedUsersData[i].data.workDaysAdded += 1;
            subscribedUsersData[i].data.timesheetHistory = [
                ...subscribedUsersData[i].data.timesheetHistory,
                ...timesheetHistory,
            ];

            delete subscribedUsersData[i].data.password;

            await updateUser(
                database,
                subscribedUsersData[i].id,
                subscribedUsersData[i].data
            );

            // await sendEmailNotification(
            //     subscribedUsersData[i].data,
            //     composeEmailManualTimesheetMessage(timesheetHistory)
            // );

            // await sendSlackNotification(
            //     subscribedUsersData[i].data,
            //     composeSlackTimesheetMessage(
            //         timesheetHistory,
            //         subscribedUsersData[i].data.slackMemberId
            //     )
            // );
        }
    }

    await markDailyTask(database, currentMoment.format(DATE_FORMATS.default));
};
