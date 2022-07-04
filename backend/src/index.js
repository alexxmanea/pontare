import { createServer, startServer } from "./RestApi.js";
import { initializeFirebaseApp } from "./Firebase.js";
import schedule from "node-schedule";

const firebaseDatabase = initializeFirebaseApp();

const httpServer = createServer();
startServer(httpServer, firebaseDatabase);

const dailyTimesheetJob = schedule.scheduleJob(
    { hour: 10, minute: 0, second: 0 },
    () => {
        console.log("Daily timesheet job");
    }
);

process.on("SIGTERM", () => {
    httpServer.close(() => {
        console.log("Server closed");
    });
    schedule.gracefulShutdown();
});

process.on("SIGINT", () => {
    httpServer.close(() => {
        console.log("Server closed");
    });
    schedule.gracefulShutdown();
});
