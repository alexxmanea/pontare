import "./Settings.css";
import AutomaticTimesheet from "./automatic_timesheet/AutomaticTimesheet";
import EmailNotifications from "./email_notifications/EmailNotifications";
import SlackNotifications from "./slack_notifications/SlackNotifications";

export default function Settings() {
    return (
        <>
            <AutomaticTimesheet />
            <EmailNotifications />
            <SlackNotifications />
        </>
    );
}
