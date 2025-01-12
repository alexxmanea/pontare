import CryptoJS from "crypto-js";
import PRIVATE_KEY from "../secure/password_encryption_private_key.json" with { type: "json" };

export const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, PRIVATE_KEY.private_key).toString();
}

export const decryptPassword = (password) => {
    return CryptoJS.AES.decrypt(password, PRIVATE_KEY.private_key).toString(CryptoJS.enc.Utf8);
}
