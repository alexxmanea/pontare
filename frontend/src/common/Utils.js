import PUBLIC_HOLIDAYS from "../assets/public_holidays.json";
import { DATE_FORMAT } from "./Constants.js";

const VALID_EMAIL_REGEX =
    /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*.?[a-zA-Z0-9])*.[a-zA-Z](-?[a-zA-Z0-9])+$/;

export const isValidEmail = (email) => {
    if (!email) return false;

    const emailParts = email.split("@");

    if (emailParts.length !== 2) return false;

    const account = emailParts[0];
    const address = emailParts[1];

    if (account.length > 64) return false;
    else if (address.length > 255) return false;

    const domainParts = address.split(".");
    if (
        domainParts.some(function (part) {
            return part.length > 63;
        })
    )
        return false;

    if (!VALID_EMAIL_REGEX.test(email)) return false;

    return true;
};

export const isInoviumEmail = (email) => {
    const emailParts = email.split("@");

    const address = emailParts[1];

    if (address !== "inovium.ro") return false;

    return true;
};

export const showLoadingScreen = (setSpinnerIsLoading, value) => {
    setSpinnerIsLoading(value);
    if (value) {
        document.getElementsByTagName("body")[0].style = "pointer-events: none";
    } else {
        let body = document.getElementsByTagName("body")[0];
        body.style.removeProperty("pointer-events");
    }
};

export const isWeekend = (momentValue) => {
    if (!momentValue?.isValid()) {
        return false;
    }
    return momentValue.isoWeekday() === 6 || momentValue.isoWeekday() === 7;
};

export const isHoliday = (momentValue) => {
    if (!momentValue?.isValid()) {
        return false;
    }

    let isHoliday = false;

    PUBLIC_HOLIDAYS.forEach((holiday) => {
        if (momentValue.format(DATE_FORMAT) === holiday.date) {
            isHoliday = true;
            return;
        }
    });

    return isHoliday;
};

export const isWeekendOrHoliday = (momentValue) => {
    return isWeekend(momentValue) || isHoliday(momentValue);
};
