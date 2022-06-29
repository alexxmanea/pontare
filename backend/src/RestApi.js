import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { checkUserCredentials, insertUser } from "./Firebase.js";
import { checkValidTimesheetCredentials } from "./Timesheet.js";

const HTTP_PORT = 3001;
const INVALID_CREDENTIALS = "invalid_credentials";
const INVALID_TIMESHEET_CREDENTIALS = "invalid_timesheet_credentials";
const USER_EXISTS = "user_exists";

const httpServer = express();

httpServer.use(cors());
httpServer.use(bodyParser.json());

httpServer.post("/api/login", async (request, response) => {
    const username = request.body.username;
    const password = request.body.password;

    const isValidLoginInfo = await checkUserCredentials(username, password);

    if (!isValidLoginInfo) {
        response.send(INVALID_CREDENTIALS);
    }

    response.end();
});

httpServer.post("/api/register", async (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    const email = request.body.email;

    if (!await checkValidTimesheetCredentials(username, password)) {
        response.send(INVALID_TIMESHEET_CREDENTIALS);
        response.end();
        return;
    }

    const couldInsertUser = await insertUser(username, password, email);

    if (!couldInsertUser) {
        response.send(USER_EXISTS);
    }

    response.end();
});

httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server listening on port ${HTTP_PORT}`);
});
