import "./AutomaticTimesheet.css";
import { useState, useEffect } from "react";
import { useGlobalState } from "../../../../common/GlobalState";
import { REST_URL, SERVER_ERROR } from "../../../../common/RestApi";
import axios from "axios";
import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

export default function AutomaticTimesheet() {
    const [userId] = useGlobalState("userId");
    const [automaticTimesheetSubscription, setAutomaticTimesheetSubscription] =
        useState(false);
    const [dialogFields, setDialogFields] = useState(null);

    useEffect(() => {
        axios
            .get(`${REST_URL}/api/automatictimesheet`, {
                params: {
                    userId: userId,
                },
            })
            .then((response) => {
                const data = response.data;
                data.automaticTimesheetSubscription &&
                    setAutomaticTimesheetSubscription(
                        data.automaticTimesheetSubscription
                    );
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
                    title: "Automatic timesheet",
                    content: "Server error. Please try again.",
                });
            });
    }, []);

    const toggleAutomaticTimesheet = () => {
        axios
            .post(`${REST_URL}/api/automatictimesheet`, {
                userId: userId,
                automaticTimesheetSubscription: !automaticTimesheetSubscription,
            })
            .then((response) => {
                if (response.data === SERVER_ERROR) {
                    setDialogFields({
                        title: "Automatic timesheet",
                        content: "Server error. Please try again.",
                    });
                    return;
                }

                setAutomaticTimesheetSubscription(
                    !automaticTimesheetSubscription
                );
            })
            .catch((error) => {
                setDialogFields({
                    title: "Automatic timesheet",
                    content: "Server error. Please try again.",
                });
            });
    };

    return (
        <div className="automaticTimesheet-container">
            <div className="automaticTimesheet-title">Automatic timesheet</div>
            <Button
                className="automaticTimesheet-button"
                variant="contained"
                color={automaticTimesheetSubscription ? "success" : "error"}
                onClick={toggleAutomaticTimesheet}
            >
                {automaticTimesheetSubscription ? "Enabled" : "Disabled"}
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
}
