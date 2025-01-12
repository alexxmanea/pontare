import axios from "axios";
import SLACK_WEBHOOKS from "../../secure/slack_webhooks.json" with { type: "json" };
import { parseDatesToString } from "../Utils.js";
import { DAY_TYPES } from "../Constants.js";

export const sendSlackNotification = async (data, message) => {
    if (
        data.slackSubscription !== true ||
        data.slackMemberId === undefined ||
        data.slackMemberId === null ||
        !data.slackMemberId?.length
    ) {
        return;
    }

    try {
        await axios.post(SLACK_WEBHOOKS.url, message);
    } catch (error) {
        console.error(error);
    }
};

export const composeSlackTimesheetMessage = (timesheet, slackMemberId) => {
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
