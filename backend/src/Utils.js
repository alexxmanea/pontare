import { DATE_FORMAT, DAY_TYPES } from "./Constants.js";
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

export const getTimesheetEntry = (interval, dayType, daysUsed) => {
    const startingDay = moment(interval[0], DATE_FORMAT);
    let endingDay = null;
    if (interval.length === 2) {
        endingDay = moment(interval[1], DATE_FORMAT);
    }

    return {
        startingDay: startingDay,
        endingDay: endingDay,
        type: dayType,
        daysUsed: daysUsed,
    };
};

export const composeSlackManualTimesheetMessage = (
    timesheet,
    slackMemberId
) => {
    const title = "Timesheet submitted";
    const subtitle = `<@${slackMemberId}> added the following intervals to his timesheet:`;
    const body = timesheet
        .map((timesheetEntry) => {
            const intervalString = parseDatesToString(
                timesheetEntry.startingDay,
                timesheetEntry.endingDay
            );
            const daysUsedString = timesheetEntry.daysUsed;
            const dayTypeString = timesheetEntry.type;
            if (dayTypeString === DAY_TYPES.workday) {
                return `- ${intervalString} | ${dayTypeString}`;
            } else {
                return `- ${intervalString} | ${daysUsedString} days used | ${dayTypeString}`;
            }
        })
        .join("\n");

    const message = {
        text: title + "\n" + subtitle + "\n" + body,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: title,
                },
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: subtitle,
                },
            },
            {
                type: "section",
                text: {
                    type: "plain_text",
                    text: body,
                },
            },
        ],
    };

    return message;
};

export const composeEmailManualTimesheetMessage = (timesheet) => {
    const title = "Timesheet submitted";
    const subtitle = `You added the following intervals to your timesheet:`;
    const body = timesheet
        .map((timesheetEntry) => {
            const intervalString = parseDatesToString(
                timesheetEntry.startingDay,
                timesheetEntry.endingDay
            );
            const daysUsedString = timesheetEntry.daysUsed;
            const dayTypeString = timesheetEntry.type;
            if (dayTypeString === DAY_TYPES.workday) {
                return `- ${intervalString} | ${dayTypeString}`;
            } else {
                return `- ${intervalString} | ${daysUsedString} days used | ${dayTypeString}`;
            }
        })
        .join("\n");

    return { subject: title, body: subtitle + "\n" + body };
};

export const parseIntervalToString = (interval) => {
    const intervalString = interval
        .map((interval) => interval.format(DATE_FORMAT))
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
