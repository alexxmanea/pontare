import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import FIREBASE_DETAILS from "../secure/firebase.json" assert { type: "json" };
import { encryptPassword, decryptPassword } from "./PasswordEncryption.js";
import { DEFAULT_USER_DATA } from "./Constants.js";

export const initializeFirebaseApp = () => {
    initializeApp({
        credential: cert(FIREBASE_DETAILS.service_account),
        databaseURL: FIREBASE_DETAILS.database_url,
    });

    return getFirestore();
};

export const checkUserCredentials = async (database, username, password) => {
    const snapshot = await getUsers(database);

    let isValidLoginInfo = null;

    snapshot.forEach((entry) => {
        if (isValidLoginInfo === null) {
            const data = entry.data();

            let decryptedPassword = decryptPassword(data.password);

            if (username === data.username && password === decryptedPassword) {
                isValidLoginInfo = entry.id;
            }
        }
    });

    return isValidLoginInfo;
};

export const getUserByUsername = async (database, username) => {
    const snapshot = await getUsers(database);

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

export const getUserData = async (database, userId) => {
    const snapshot = await database.collection("users").doc(userId).get();
    const data = snapshot.data();

    return data;
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
        ...DEFAULT_USER_DATA,
    });

    return true;
};

const checkIfUserExists = async (database, username, email) => {
    const snapshot = await getUsers(database);

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

export const toggleAutomaticTimesheet = async (database, userId, value) => {
    await updateUser(database, userId, {
        automaticTimesheetSubscription: value,
    });
};

export const toggleEmailSubscription = async (database, userId, value) => {
    await updateUser(database, userId, {
        emailSubscription: value,
    });
};

export const toggleSlackSubscription = async (database, userId, value) => {
    await updateUser(database, userId, {
        slackSubscription: value,
    });
};

export const changeEmail = async (database, userId, email) => {
    await updateUser(database, userId, {
        email: email,
    });
};

export const changeSlackMemberId = async (database, userId, slackMemberId) => {
    await updateUser(database, userId, {
        slackMemberId: slackMemberId,
    });
};

export const changeDefaultVacationDays = async (
    database,
    userId,
    defaultVacationDays
) => {
    await updateUser(database, userId, {
        defaultVacationDays: defaultVacationDays,
    });
};

export const markDailyTask = async (database, dateString) => {
    await database
        .collection("logs")
        .doc("daily_tasks")
        .update({ tasks: FieldValue.arrayUnion(dateString) });
};

export const getUsers = async (database) => {
    const usersData = await database.collection("users").get();
    return usersData;
};

export const getDailyTasks = async (database) => {
    const tasksData = await database
        .collection("logs")
        .doc("daily_tasks")
        .get();
    return tasksData;
};

export const getTeamMembers = async (database, team) => {
    const teamData = await database.collection("teams").doc(team).get();
    const teamMembers = teamData.data();

    return teamMembers.members;
};
