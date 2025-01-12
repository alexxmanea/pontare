import nodemailer from "nodemailer";
import EMAIL_CREDENTIALS from "../../secure/email_credentials.json" with { type: "json" };
import { parseDatesToString } from "../Utils.js";
import { DAY_TYPES } from "../Constants.js";

export const sendEmailNotification = async (data, message) => {
    if (data?.emailSubscription !== true || !data?.email) {
        return;
    }

    await sendEmail(data.email, message);
};

export const sendEmail = async (email, data) => {
    const transporter = nodemailer.createTransport({
        host: EMAIL_CREDENTIALS.host,
        port: EMAIL_CREDENTIALS.port,
        secure: true,
        auth: {
            user: EMAIL_CREDENTIALS.username,
            pass: EMAIL_CREDENTIALS.password,
        },
    });

    const mailOptions = {
        from: `${EMAIL_CREDENTIALS.name} <${EMAIL_CREDENTIALS.username}>`,
        to: email,
        subject: data.subject,
        text: data.body,
    };

    await transporter.sendMail(mailOptions);
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
