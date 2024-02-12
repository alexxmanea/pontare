import "./EmailNotifications.css";
import { useState, useEffect } from "react";
import { useGlobalState } from "../../../../common/GlobalState";
import { REST_URL, SERVER_ERROR } from "../../../../common/RestApi";
import { isValidEmail, isEximprodEmail } from "../../../../common/Utils";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ReplayIcon from "@mui/icons-material/Replay";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

const EmailNotifications = () => {
    const [userId] = useGlobalState("userId");
    const [emailSubscription, setEmailSubscription] = useState(false);
    const [originalEmail, setOriginalEmail] = useState("");
    const [email, setEmail] = useState("");
    const [dialogFields, setDialogFields] = useState(null);

    useEffect(() => {
        axios
            .get(`${REST_URL}/api/emailnotifications`, {
                params: {
                    userId: userId,
                },
            })
            .then((response) => {
                const data = response.data;
                data.email && setEmail(data.email);
                data.email && setOriginalEmail(data.email);
                data.emailSubscription &&
                    setEmailSubscription(data.emailSubscription);

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
                    title: "Email notifications",
                    content: "Server error. Please try again.",
                });
            });
    }, []);

    const changeEmail = () => {
        axios
            .post(`${REST_URL}/api/changeemail`, {
                userId: userId,
                email: email,
            })
            .then((response) => {
                if (response.data === SERVER_ERROR) {
                    setDialogFields({
                        title: "Email change",
                        content: "Server error. Please try again.",
                    });
                    return;
                }

                setOriginalEmail(email);
                setEmail(email);

                setDialogFields({
                    title: "Email change",
                    content: "Your email has been changed.",
                });
            })
            .catch((error) => {
                setDialogFields({
                    title: "Email change",
                    content: "Server error. Please try again.",
                });
            });
    };

    const toggleEmailSubscription = () => {
        axios
            .post(`${REST_URL}/api/emailsubscription`, {
                userId: userId,
                emailSubscription: !emailSubscription,
            })
            .then((response) => {
                if (response.data === SERVER_ERROR) {
                    setDialogFields({
                        title: "Email notifications",
                        content: "Server error. Please try again.",
                    });
                    return;
                }

                setEmailSubscription(!emailSubscription);
            })
            .catch((error) => {
                setDialogFields({
                    title: "Email notifications",
                    content: "Server error. Please try again.",
                });
            });
    };

    return (
        <div className="emailNotifications-container">
            <div className="emailNotifications-title">Email notifications</div>
            <div className="emailNotifications-changeEmail-container">
                <TextField
                    className="emailNotifications-textfield"
                    label="Eximprod Email"
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
                        !isEximprodEmail(email) ||
                        email === originalEmail
                    }
                    onClick={changeEmail}>
                    Change email
                </Button>
            </div>
            <Button
                className="emailNotifications-button"
                variant="contained"
                color={emailSubscription ? "success" : "error"}
                onClick={toggleEmailSubscription}>
                {emailSubscription ? "Enabled" : "Disabled"}
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

export default EmailNotifications;
