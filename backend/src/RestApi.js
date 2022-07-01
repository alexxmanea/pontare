import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { checkUserCredentials, insertUser } from "./Firebase.js";
import { checkValidTimesheetCredentials } from "./Timesheet.js";

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
        response.end();
    });

    httpServer.listen(REST_PORT, () => {
        console.log(SERVER_STARTED_MESSAGE);
    });
};
