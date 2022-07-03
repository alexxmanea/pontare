import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
    checkUserCredentials,
    getUserData,
    insertUser,
    updateUser,
    toggleAutomaticTimesheet,
    toggleEmailSubscription,
    toggleSlackSubscription,
    changeEmail,
    changeSlackMemberId,
} from "./Firebase.js";
import {
    addToTimesheet,
    checkValidTimesheetCredentials,
    closeBrowser,
    startPageAndLogin,
    getRemoteTimesheetPageContent,
} from "./Timesheet.js";
import {
    DATE_FORMAT,
    ADD_TO_TIMESHEET_DELAY,
    DAY_TYPES,
    SERVER_ERROR,
} from "./Constants.js";
import { delay } from "./Utils.js";
import moment from "moment";

const REST_PROTOCOL = "http";
const REST_ADDRESS = "82.76.148.236";
const REST_PORT = "3001";
const REST_URL = `${REST_PROTOCOL}://${REST_ADDRESS}:${REST_PORT}`;

const SERVER_STARTED_MESSAGE = `${REST_PROTOCOL.toUpperCase()} server listening on ${REST_URL}`;

const INVALID_CREDENTIALS = "invalid_credentials";
const INVALID_TIMESHEET_CREDENTIALS = "invalid_timesheet_credentials";
const USER_EXISTS = "user_exists";

export const createServer = () => {
    const httpServer = express();
    addServerOptions(httpServer);

    return httpServer;
};

const addServerOptions = (httpServer) => {
    httpServer.use(cors());
    httpServer.use(bodyParser.json());
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
        }

        response.end();
    });

    httpServer.post("/api/submittimesheet", async (request, response) => {
        const timesheet = request?.body?.timesheet;
        const userId = request?.body?.userId;

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

        for (let i = 0; i < timesheet.length; i++) {
            const entry = timesheet[i];
            let interval = [...entry.interval];
            if (interval.length === 1) {
                interval.push(interval[0]);
            }

            const startingDay = moment(interval[0], DATE_FORMAT);
            const endingDay = moment(interval[1], DATE_FORMAT);

            const timesheetEntry = {
                startingDay: startingDay.format(DATE_FORMAT),
                endingDay: endingDay.format(DATE_FORMAT),
                daysUsed: 0,
                type: entry.type,
            };

            if (
                startingDay.format(DATE_FORMAT) ===
                endingDay.format(DATE_FORMAT)
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
            }

            timesheetHistory.push(timesheetEntry);
        }

        data.vacationDaysAdded += vacationDaysAdded;
        data.workDaysAdded += workDaysAdded;
        data.timesheetHistory = [...data.timesheetHistory, ...timesheetHistory];
        data.vacationDaysRemaining -= vacationDaysAdded;

        delete data.password;

        await updateUser(firebaseDatabase, userId, data);

        await closeBrowser(browser);
        response.end();
    });

    httpServer.get("/api/settings", async (request, response) => {
        const userId = request?.query?.userId;

        if (!userId || !userId?.length) {
            response.send(SERVER_ERROR);
            return;
        }

        const data = await getUserData(firebaseDatabase, userId);

        const responseBody = {
            automaticTimesheetSubscription: data.automaticTimesheetSubscription,
            email: data.email,
            emailSubscription: data.emailSubscription,
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

    httpServer.listen(REST_PORT, () => {
        console.log(SERVER_STARTED_MESSAGE);
    });
};
