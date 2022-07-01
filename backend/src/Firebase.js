import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import SERVICE_ACCOUNT from "../secure/firebase_service_account.json" assert { type: "json" };
import { encryptPassword, decryptPassword } from "./PasswordEncryption.js";

const FIREBASE_DATABASE_URL =
    "https://pontare-ce116-default-rtdb.europe-west1.firebasedatabase.app";

export const initializeFirebaseApp = () => {
    initializeApp({
        credential: cert(SERVICE_ACCOUNT),
        databaseURL: FIREBASE_DATABASE_URL,
    });

    return getFirestore();
};

export const checkUserCredentials = async (database, username, password) => {
    const snapshot = await database.collection("users").get();

    let isValidLoginInfo = false;

    snapshot.forEach((entry) => {
        const data = entry.data();

        let decryptedPassword = decryptPassword(data.password);

        if (username === data.username && password === decryptedPassword) {
            isValidLoginInfo = true;
        }
    });

    return isValidLoginInfo;
};

export const insertUser = async (database, username, password, email) => {
    const userExists = await checkIfUserExists(database, username, email);

    if (userExists) {
        return false;
    }

    await database.collection("users").add({
        username: username,
        password: encryptPassword(password),
        email: email,
    });

    return true;
};

const checkIfUserExists = async (database, username, email) => {
    const snapshot = await database.collection("users").get();

    let userExists = false;

    snapshot.forEach((entry) => {
        const data = entry.data();
        if (username === data.username || email === data.email) {
            userExists = true;
            return;
        }
    });

    return userExists;
};
