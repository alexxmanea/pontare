import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
    type: "service_account",
    project_id: "pontare-ce116",
    private_key_id: "fd6b3a01e1c41235bbf2e48d00e0d38a1ada21e0",
    private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9/TBZaUUjY+ze\nov23hIDXNNkMmThPedydhpZmdnUR0PwTsZzHxo8qVRhyd2ZQe+ASl4INiZmiacgj\neHwkEgmwyEG2EZ91rSAaKAQH2mewAgGlwRdORVdx1aTDXWJIzkSm83QaApZPeKyS\nSj0SYxORvQin6LRyQz5o3lbYva0DhWIjoER25afb3PZW86EpePD6MH0SgoaNyqxD\notHR1892bSHFuPeaeBXmIE+HT8k/yQz/54fSInhHGrl3mIMvZVhPcx5ODsqQDTeC\nJ0WbsY03E5jdytWHt30qDZ08fN9cbDpzCxOrJ0K/MpmF0Zr8OKiWzrkaNtMRhyiC\nUUodvCkTAgMBAAECggEABvYZH9WQ7tMUQxymCp34yJKcvSjv4mZXAAT6ehIvKsOi\nf24NGePqN0UvwaGXiYqYbWAmEKFflFTV06FwTwV9/paok4pklTnrfREiYKyPCwu1\nl9XMKQqINh77kdaeEkJnHL8YP11eFb+kJaZwQ5sp1iwTOG/KgYy/1+O/gPox2L7M\noEEgEmeF4PJR92NHoZs12e0QebqdzNw/TUu8MjeD+EWZjcZOxCTq++nW5T4LsW/q\nRJLUCiFD7aU7I0R8qlXx1DHr04nF6ClBjBWGSHwMV5UAPJa6Qt6FE7s2TSVvTWAq\n6bFsYHDrwUOv3diGqco2gfdDn9LIFDjznNlZr2d/RQKBgQD5dnxBO/c9OpA8ASDd\noe0XLtTatxx3B+GeLNRBotar2YtT5NLFD2wi2uMWhWSG94RSIqOZyiU8598tDtq1\nFMVHasWJougX7jc6UEcL1qOTEpFIYOKSXB9butrEc1YlJ5Z2EL6V66kv9VMQKZmM\nOeU6JrkcPkMUolSUR1FKE/gfNQKBgQDC97mbbzFu41FA4u1DeKrIBRcjqSjUnqcm\nKdPgBg8UfMkb7dU7kjpaloqdxwFAVM2CsVeds5w7UYpsPiNgODnyauPwXFe23CIX\nAZWedct/Eazu8Q5HgbVgQ0T8cR8A90bi5z31+Qnv1xHYsojXZpBmHizyCNqXBdnY\naIGX3BbIJwKBgE0w25v36TYaA/19P+U0sL9mr1iKJpWya57dMkSpFZIRe6pW+N0f\nO4/BeVlDp2qX9mrP6x2wTjt9aDJyETzNE4pYwI0pSnX1MUOrCYDhRrZAnZHu4Mz3\nEoD43a7CHZrbmBQqdD7BsBV17ODobmnUlFidGNRjc7BT1qYXN1EbwsAtAoGAYoYI\n93EjS+P3hZCnUXdC5j0cSlsLVRavZOuyM/0b1cCRaFmxbZ8hefGlLsIH8dho2eiA\nXCMNijRUfQqRmegP8F7vvOENOkzXtUSJtT/Vi+sEtuJ90sjLPVABJoiLoFNVMQim\nGQy2ZssKK7VczWz4/4G0OMMco0DDq0Z0ZqdDo/UCgYEA1ycEl5uK10srWPfZY9/f\nneqnu03j6mBYZUIiPm7u74V0a/ndgN9HJUg60WmOIkiYUI+xNaAsN+RjIkxb8PFt\nW14ZrwNitWJVnJFfaM0VtYOl9YaNQpHtcxVCj2jLjHkK4Z2wzGUZ68IZarRDV+Di\n1ubhHLA/S9HMiDsSFFMTltE=\n-----END PRIVATE KEY-----\n",
    client_email:
        "firebase-adminsdk-tbhmb@pontare-ce116.iam.gserviceaccount.com",
    client_id: "107504525708772850199",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-tbhmb%40pontare-ce116.iam.gserviceaccount.com",
};

initializeApp({
    credential: cert(serviceAccount),
    databaseURL:
        "https://pontare-ce116-default-rtdb.europe-west1.firebasedatabase.app",
});
const db = getFirestore();

export const checkUserCredentials = async (username, password) => {
    const snapshot = await db.collection("users").get();

    let isValidLoginInfo = false;

    snapshot.forEach((entry) => {
        const data = entry.data();
        if (username === data.username && password === data.password) {
            isValidLoginInfo = true;
            return;
        }
    });

    return isValidLoginInfo;
};

export const insertUser = async (username, password, email) => {
    const userExists = await checkIfUserExists(username, email);

    if (userExists) {
        return false;
    }

    await db.collection("users").add({
        username,
        password,
        email,
    });

    return true;
};

const checkIfUserExists = async (username, email) => {
    const snapshot = await db.collection("users").get();

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
