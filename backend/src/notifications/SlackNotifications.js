import axios from "axios";
import SLACK_WEBHOOKS from "../../secure/slack_webhooks.json" assert { type: "json" };

export const sendSlackNotification = (data, message) => {
    if (
        data.slackSubscription !== true ||
        data.slackMemberId === undefined ||
        data.slackMemberId === null ||
        !data.slackMemberId?.length
    ) {
        return;
    }

    axios
        .post(SLACK_WEBHOOKS.url, message)
        .then((response) => {})
        .catch((error) => {
            console.log(error);
        });
};
