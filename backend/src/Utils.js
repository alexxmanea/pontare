import { DATE_FORMAT } from "./Constants.js";
import PUBLIC_HOLIDAYS from "../assets/public_holidays.json" assert { type: "json" };

export const delay = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
