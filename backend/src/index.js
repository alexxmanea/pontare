import { createServer, startServer } from "./RestApi.js";
import { initializeFirebaseApp } from "./Firebase.js";

const firebaseDatabase = initializeFirebaseApp();

const httpServer = createServer();
startServer(httpServer, firebaseDatabase);

process.on("SIGTERM", () => {
    httpServer.close(() => {
        console.log("Server closed");
    });
});

process.on("SIGINT", () => {
    httpServer.close(() => {
        console.log("Server closed");
    });
});
