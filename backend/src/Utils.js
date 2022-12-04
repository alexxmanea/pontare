import { DATE_FORMATS, DAY_TYPES } from "./Constants.js";
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
        if (momentValue.format(DATE_FORMATS.default) === holiday.date) {
            isHoliday = true;
            return;
        }
    });

    return isHoliday;
};

export const isWeekendOrHoliday = (momentValue) => {
    return isWeekend(momentValue) || isHoliday(momentValue);
};

export const getTimesheetEntry = (interval, dayType, daysUsed) => {
    const startingDay = moment(interval[0], DATE_FORMATS.default);
    let endingDay = null;
    if (interval.length === 2) {
        endingDay = moment(interval[1], DATE_FORMATS.default);
    }

    return {
        startingDay: startingDay,
        endingDay: endingDay,
        type: dayType,
        daysUsed: daysUsed,
    };
};

export const parseIntervalToString = (interval) => {
    const intervalString = interval
        .map((interval) => interval.format(DATE_FORMATS.default))
        .join(" - ");
    return intervalString;
};

export const parseDatesToString = (startingDay, endingDay) => {
    let date = startingDay;

    if (endingDay !== null) {
        date += " - " + endingDay;
    }

    return date;
};
