import "./SlackNotifications.css";
import { useState, useEffect } from "react";
import { useGlobalState } from "../../../../common/GlobalState";
import { SLACK_MEMBER_ID_TUTORIAL } from "../../../../common/Constants";
import { REST_URL, SERVER_ERROR } from "../../../../common/RestApi";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ReplayIcon from "@mui/icons-material/Replay";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const SlackNotifications = () => {
    const [userId] = useGlobalState("userId");
    const [slackSubscription, setSlackSubscription] = useState(false);
    const [slackMemberId, setSlackMemberId] = useState("");
    const [originalSlackMemberId, setOriginalSlackMemberId] = useState("");
    const [dialogFields, setDialogFields] = useState(null);

    useEffect(() => {
        axios
            .get(`${REST_URL}/api/slacknotifications`, {
                params: {
                    userId: userId,
                },
            })
            .then((response) => {
                const data = response.data;
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
                setDialogFields({
                    title: "Slack notifications",
                    content: "Server error. Please try again.",
                });
            });
    }, []);

    const changeSlackMemberId = () => {
        axios
            .post(`${REST_URL}/api/changeslackmemberid`, {
                userId: userId,
                slackMemberId: slackMemberId,
            })
            .then((response) => {
                if (response.data === SERVER_ERROR) {
                    setDialogFields({
                        title: "Slack Member ID change",
                        content: "Server error. Please try again.",
                    });
                    return;
                }

                setOriginalSlackMemberId(slackMemberId);
                setSlackMemberId(slackMemberId);

                setDialogFields({
                    title: "Slack Member ID change",
                    content: "Your Slack Member ID has been changed.",
                });
            })
            .catch((error) => {
                setDialogFields({
                    title: "Slack Member ID change",
                    content: "Server error. Please try again.",
                });
            });
    };

    const toggleSlackSubscription = () => {
        axios
            .post(`${REST_URL}/api/slacksubscription`, {
                userId: userId,
                slackSubscription: !slackSubscription,
            })
            .then((response) => {
                if (response.data === SERVER_ERROR) {
                    setDialogFields({
                        title: "Slack notifications",
                        content: "Server error. Please try again.",
                    });
                    return;
                }

                setSlackSubscription(!slackSubscription);
            })
            .catch((error) => {
                setDialogFields({
                    title: "Slack notifications",
                    content: "Server error. Please try again.",
                });
            });
    };

    return (
        <div className="slackNotifications-container">
            <Tooltip
                title="How to find your Slack Member ID"
                placement="top">
                <IconButton
                    className="slackNotifications-tutorial"
                    onClick={() => {
                        window.open(
                            SLACK_MEMBER_ID_TUTORIAL,
                            "_blank",
                            "noopener,noreferrer"
                        );
                    }}>
                    <InfoOutlinedIcon />
                </IconButton>
            </Tooltip>
            <div className="slackNotifications-title">Slack notifications</div>
            <div className="slackNotifications-changeMemberId-container">
                <TextField
                    className="slackNotifications-textfield"
                    label="Slack Member ID"
                    variant="outlined"
                    type="text"
                    value={slackMemberId}
                    onChange={(event) => setSlackMemberId(event.target.value)}
                    InputProps={{
                        endAdornment: (
                            <Tooltip
                                title="Reset Slack Member ID"
                                placement="top">
                                <IconButton
                                    onClick={() =>
                                        setSlackMemberId(originalSlackMemberId)
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
                    }
                    onClick={changeSlackMemberId}>
                    Change Member ID
                </Button>
            </div>
            <Button
                className="slackNotifications-button"
                variant="contained"
                color={slackSubscription ? "success" : "error"}
                disabled={
                    !originalSlackMemberId || !originalSlackMemberId.length
                }
                onClick={toggleSlackSubscription}>
                {slackSubscription ? "Enabled" : "Disabled"}
            </Button>
            <Dialog open={dialogFields !== null}>
                <DialogTitle>{dialogFields?.title}</DialogTitle>
                <DialogContent>{dialogFields?.content}</DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => setDialogFields(null)}>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SlackNotifications;
