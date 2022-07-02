import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
    checkUserCredentials,
    getUserPassword,
    insertUser,
} from "./Firebase.js";
import {
    addToTimesheet,
    checkValidTimesheetCredentials,
    closeBrowser,
    startPageAndLogin,
    getRemoteTimesheetPageContent,
} from "./Timesheet.js";
import { DATE_FORMAT, ADD_TO_TIMESHEET_DELAY } from "./Constants.js";
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

        const isValidLoginInfo = await checkUserCredentials(
            firebaseDatabase,
            username,
            password
        );

        if (!isValidLoginInfo) {
            response.send(INVALID_CREDENTIALS);
        }

        response.end();
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
        const username = request?.body?.username;

        if (!timesheet || !timesheet.length) {
            response.send(SERVER_ERROR);
            return;
        }

        const password = await getUserPassword(firebaseDatabase, username);

        const { page, browser, retCode } = await startPageAndLogin(
            username,
            password
        );

        if (!retCode) {
            response.send(SERVER_ERROR);
            return;
        }

        const remoteTimesheetPageContent = await getRemoteTimesheetPageContent(page);

        for (let i = 0; i < timesheet.length; i++) {
            const entry = timesheet[i];
            let interval = [...entry.interval];
            if (interval.length === 1) {
                interval.push(interval[0]);
            }

            const startingDay = moment(interval[0], DATE_FORMAT);
            const endingDay = moment(interval[1], DATE_FORMAT);

            let currentMoment = moment(startingDay);
            while (currentMoment.diff(endingDay, "days") <= 0) {
                await addToTimesheet(
                    page,
                    remoteTimesheetPageContent,
                    currentMoment,
                    interval.type
                );
                await delay(ADD_TO_TIMESHEET_DELAY);
                currentMoment.add(1, "days");
            }
        }

        await closeBrowser(browser);
        response.end();
    });

    httpServer.listen(REST_PORT, () => {
        console.log(SERVER_STARTED_MESSAGE);
    });
};
