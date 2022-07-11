import { createServer, startServer, runDailyTask } from "./RestApi.js";
import { initializeFirebaseApp } from "./Firebase.js";
import schedule from "node-schedule";

const firebaseDatabase = initializeFirebaseApp();

const httpServer = createServer();
startServer(httpServer, firebaseDatabase);

const dailyTimesheetJob = schedule.scheduleJob(
    { hour: 3, minute: 36, second: 12 },
    async () => {
        await runDailyTask(firebaseDatabase);
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
