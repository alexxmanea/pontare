import "./Settings.css";
import AutomaticTimesheet from "./automatic_timesheet/AutomaticTimesheet";
import EmailNotifications from "./email_notifications/EmailNotifications";
import SlackNotifications from "./slack_notifications/SlackNotifications";

const Settings = () => {
    return (
        <>
            <AutomaticTimesheet />
            <EmailNotifications />
            <SlackNotifications />
        </>
    );
};

export default Settings;
