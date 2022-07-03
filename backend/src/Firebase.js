import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import SERVICE_ACCOUNT from "../secure/firebase_service_account.json" assert { type: "json" };
import { encryptPassword, decryptPassword } from "./PasswordEncryption.js";
import {
    DEFAULT_VACATION_DAYS,
    DEFAULT_WORKDAYS_ADDED,
    DEFAULT_VACATION_DAYS_ADDED,
    DEFAULT_SLACK_SUBSCRIPTION,
    DEFAULT_SLACK_MEMBER_ID,
    DEFAULT_EMAIL_SUBSCRIPTION,
    DEFAULT_DAILY_TIMESHEET_SUBSCRIPTION,
    DEFAULT_TIMESHEET_HISTORY,
} from "./Constants.js";

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

export const getUserByUsername = async (database, username) => {
    const snapshot = await database.collection("users").get();

    let data = null;
    let id = null;

    snapshot.forEach((entry) => {
        const entryData = entry.data();
        if (data === null && id === null) {
            if (username === entryData.username) {
                data = entryData;
                id = entry.id;
            }
        }
    });

    data.password = decryptPassword(data.password);
    return { id: id, data: data };
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
        vacationDaysRemaining: DEFAULT_VACATION_DAYS,
        workDaysAdded: DEFAULT_WORKDAYS_ADDED,
        vacationDaysAdded: DEFAULT_VACATION_DAYS_ADDED,
        slackSubscription: DEFAULT_SLACK_SUBSCRIPTION,
        slackMemberId: DEFAULT_SLACK_MEMBER_ID,
        emailSubscription: DEFAULT_EMAIL_SUBSCRIPTION,
        automaticTimesheetSubscription: DEFAULT_DAILY_TIMESHEET_SUBSCRIPTION,
        timesheetHistory: DEFAULT_TIMESHEET_HISTORY,
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

export const updateUser = async (database, id, data) => {
    await database.collection("users").doc(id).update(data);
};
