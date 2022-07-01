import { createServer, startServer } from "./RestApi.js";
import { initializeFirebaseApp } from "./Firebase.js";

const firebaseDatabase = initializeFirebaseApp();

const httpServer = createServer();
startServer(httpServer, firebaseDatabase);
