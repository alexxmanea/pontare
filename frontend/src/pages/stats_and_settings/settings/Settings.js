import "./Settings.css";
import { TextField, Button } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { useGlobalState } from "../../../common/GlobalState";
import { REST_URL } from "../../../common/RestApi";
import { isValidEmail, isInoviumEmail } from "../../../common/Utils";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ReplayIcon from "@mui/icons-material/Replay";

const Settings = () => {
    const [authenticatedUser] = useGlobalState("authenticatedUser");
    const [automaticTimesheetSubscription, setAutomaticTimesheetSubscription] =
        useState(false);
    const [emailSubscription, setEmailSubscription] = useState(false);
    const [slackSubscription, setSlackSubscription] = useState(false);
    const [originalEmail, setOriginalEmail] = useState("");
    const [email, setEmail] = useState("");
    const [slackMemberId, setSlackMemberId] = useState("");
    const [originalSlackMemberId, setOriginalSlackMemberId] = useState("");

    useEffect(() => {
        axios
            .get(`${REST_URL}/api/settings`, {
                params: {
                    username: authenticatedUser,
                },
            })
            .then((response) => {
                const data = response.data;
                data.automaticTimesheetSubscription &&
                    setAutomaticTimesheetSubscription(
                        data.automaticTimesheetSubscription
                    );
                data.email && setEmail(data.email);
                data.email && setOriginalEmail(data.email);
                data.emailSubscription &&
                    setEmailSubscription(data.emailSubscription);
                data.slackMemberId && setSlackMemberId(data.slackMemberId);
                data.slackMemberId &&
                    setOriginalSlackMemberId(data.slackMemberId);
                data.slackSubscription &&
                    setSlackSubscription(data.slackSubscription);

                // showLoadingScreen(setIsLoading, false);
                // if (response.data === INVALID_CREDENTIALS) {
                //     setErrorMessage(getErrorMessage(INVALID_CREDENTIALS));
                //     return;
                // }
                // setErrorMessage(getErrorMessage());
                // performLogin();
            })
            .catch((error) => {
                // showLoadingScreen(setIsLoading, false);
                // setErrorMessage(getErrorMessage(SERVER_ERROR));
            });
    }, []);

    return (
        <div className="settings-container">
            <div className="automaticTimesheet-container">
                <div className="automaticTimesheet-title">
                    Automatic Timesheet
                </div>
                <Button
                    className="automaticTimesheet-button"
                    variant="contained"
                    color={
                        automaticTimesheetSubscription ? "success" : "error"
                    }>
                    {automaticTimesheetSubscription ? "Enabled" : "Disabled"}
                </Button>
            </div>
            <div className="emailNotifications-container">
                <div className="emailNotifications-title">
                    Email notifications
                </div>
                <div className="emailNotifications-changeEmail-container">
                    <TextField
                        className="emailNotifications-textfield"
                        label="Inovium Email"
                        variant="outlined"
                        type="text"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        InputProps={{
                            endAdornment: (
                                <Tooltip title="Reset Email" placement="top">
                                    <IconButton
                                        onClick={() => setEmail(originalEmail)}>
                                        <ReplayIcon />
                                    </IconButton>
                                </Tooltip>
                            ),
                        }}
                    />
                    <Button
                        className="emailNotifications-button-changeEmail"
                        variant="contained"
                        disabled={
                            !email ||
                            !email.length ||
                            !isValidEmail(email) ||
                            !isInoviumEmail(email) ||
                            email === originalEmail
                        }>
                        Change email
                    </Button>
                </div>
                <Button
                    className="emailNotifications-button"
                    variant="contained"
                    color={emailSubscription ? "success" : "error"}>
                    {emailSubscription ? "Enabled" : "Disabled"}
                </Button>
            </div>
            <div className="slackNotifications-container">
                <div className="slackNotifications-title">
                    Slack notifications
                </div>
                <div className="slackNotifications-changeMemberId-container">
                    <TextField
                        className="slackNotifications-textfield"
                        label="Slack Member ID"
                        variant="outlined"
                        type="text"
                        value={slackMemberId}
                        onChange={(event) =>
                            setSlackMemberId(event.target.value)
                        }
                        InputProps={{
                            endAdornment: (
                                <Tooltip
                                    title="Reset Slack Member ID"
                                    placement="top">
                                    <IconButton
                                        onClick={() =>
                                            setSlackMemberId(
                                                originalSlackMemberId
                                            )
                                        }>
                                        <ReplayIcon />
                                    </IconButton>
                                </Tooltip>
                            ),
                        }}
                    />
                    <Button
                        className="slackNotifications-button-changeMemberId"
                        variant="contained"
                        disabled={
                            !slackMemberId ||
                            !slackMemberId.length ||
                            slackMemberId === originalSlackMemberId
                        }>
                        Change Member ID
                    </Button>
                </div>
                <Button
                    className="slackNotifications-button"
                    variant="contained"
                    color={slackSubscription ? "success" : "error"}
                    disabled={
                        !originalSlackMemberId || !originalSlackMemberId.length
                    }>
                    {slackSubscription ? "Enabled" : "Disabled"}
                </Button>
            </div>
        </div>
    );
};

export default Settings;
