import "./Stats.css";
import { useState, useEffect } from "react";
import { useGlobalState } from "../../../common/GlobalState";
import axios from "axios";
import { SERVER_ERROR, REST_URL } from "../../../common/RestApi";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ProgressBar from "react-bootstrap/ProgressBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { TextField, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ReplayIcon from "@mui/icons-material/Replay";

const Stats = () => {
    const [userId] = useGlobalState("userId");
    const [workDaysAdded, setWorkDaysAdded] = useState(0);
    const [vacationDaysText, setVacationDaysText] = useState(0);
    const [vacationDaysAdded, setVacationDaysAdded] = useState(0);
    const [defaultVacationDays, setDefaultVacationDays] = useState(0);
    const [dialogFields, setDialogFields] = useState(null);

    useEffect(() => {
        axios
            .get(`${REST_URL}/api/stats`, {
                params: {
                    userId: userId,
                },
            })
            .then((response) => {
                const data = response.data;
                data.workDaysAdded && setWorkDaysAdded(data.workDaysAdded);
                data.vacationDaysAdded &&
                    setVacationDaysAdded(data.vacationDaysAdded);
                data.defaultVacationDays &&
                    setDefaultVacationDays(data.defaultVacationDays);
                data.defaultVacationDays &&
                    setVacationDaysText(data.defaultVacationDays);
            })
            .catch((error) => {
                setDialogFields({
                    title: "Timesheet history",
                    content: "Server error. Please try again.",
                });
            });
    }, []);

    const changeDefaultVacationDays = () => {
        axios
            .post(`${REST_URL}/api/changedefaultvacationdays`, {
                userId: userId,
                defaultVacationDays: vacationDaysText,
            })
            .then((response) => {
                if (response.data === SERVER_ERROR) {
                    setDialogFields({
                        title: "Change default vacation days",
                        content: "Server error. Please try again.",
                    });
                    return;
                }

                setDefaultVacationDays(vacationDaysText);
            })
            .catch((error) => {
                setDialogFields({
                    title: "Change default vacation days",
                    content: "Server error. Please try again.",
                });
            });
    };

    return (
        <div className="stats-container">
            <div className="stats-title">Stats</div>
            <div className="stats-defaultVacationDays-container">
                <div className="stats-defaultVacationDays-subtitle">
                    Default vacation days
                </div>
                <div className="stats-vacation">
                    <TextField
                        className="stats-vacation-textField"
                        required
                        label="Default vacation days"
                        variant="outlined"
                        type="number"
                        value={vacationDaysText}
                        onChange={(event) =>
                            setVacationDaysText(parseInt(event.target.value))
                        }
                        InputProps={{
                            endAdornment: (
                                <Tooltip
                                    title="Reset default vacation days"
                                    placement="top">
                                    <IconButton
                                        onClick={() =>
                                            setVacationDaysText(
                                                defaultVacationDays
                                            )
                                        }>
                                        <ReplayIcon />
                                    </IconButton>
                                </Tooltip>
                            ),
                        }}
                    />
                    <Button
                        className="stats-vacation-button"
                        variant="contained"
                        onClick={changeDefaultVacationDays}
                        disabled={
                            defaultVacationDays === vacationDaysText ||
                            vacationDaysText < 0 ||
                            vacationDaysText > 75
                        }>
                        Change
                    </Button>
                </div>
                <ProgressBar
                    className="stats-vacation-progress"
                    now={
                        ((defaultVacationDays - vacationDaysAdded) /
                            defaultVacationDays) *
                        100
                    }
                    label={`${
                        defaultVacationDays - vacationDaysAdded
                    }/${defaultVacationDays} days of paid vacation remaining`}
                    variant="success"
                />
            </div>
            <div className="stats-workDaysAdded-subtitle">
                Work days added: {workDaysAdded}
            </div>
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

export default Stats;
