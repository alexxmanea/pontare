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
import moment from "moment";
import { DATE_FORMAT } from "../../../common/Constants";
import Divider from "@mui/material/Divider";
import VacationIcon from "../../../assets/images/VacationIcon.png";

const Stats = () => {
    const [userId] = useGlobalState("userId");
    const [workDaysAdded, setWorkDaysAdded] = useState(0);
    const [vacationDaysText, setVacationDaysText] = useState(0);
    const [vacationDaysAdded, setVacationDaysAdded] = useState(0);
    const [defaultVacationDays, setDefaultVacationDays] = useState(0);
    const [dialogFields, setDialogFields] = useState(null);
    const [nextVacation, setNextVacation] = useState(null);

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
                if (data.nextVacation) {
                    let nextVacationMoment = moment(
                        data.nextVacation,
                        DATE_FORMAT
                    );
                    nextVacationMoment.hours(0);
                    nextVacationMoment.minutes(0);
                    nextVacationMoment.seconds(0);

                    setNextVacation(nextVacationMoment);
                }
            })
            .catch((error) => {
                setDialogFields({
                    title: "Timesheet history",
                    content: "Server error. Please try again.",
                });
            });
    }, []);

    useEffect(() => {
        let updateNextVacationTimer;
        if (moment.isMoment(nextVacation)) {
            updateNextVacationTimer = setInterval(() => {
                setNextVacation(nextVacation.clone());
            }, 60 * 1000);
        }

        return () => {
            clearInterval(updateNextVacationTimer);
        };
    }, [nextVacation]);

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

    const getNextVacation = () => {
        let duration = moment.duration(nextVacation.diff(moment()));

        let days = Math.floor(duration.asDays());
        duration.subtract(moment.duration(days, "days"));

        let hours = Math.floor(duration.hours());
        duration.subtract(moment.duration(hours, "hours"));

        let minutes = Math.floor(duration.minutes());
        duration.subtract(moment.duration(minutes, "minutes"));

        let daysString = String("0" + days).slice(-2);
        let hoursString = String("0" + hours).slice(-2);
        let minutesString = String("0" + minutes).slice(-2);

        const nextVacationComponent = (
            <div className="stats-nextVacation">
                <img
                    src={VacationIcon}
                    className="stats-nextVacation-icon"
                    alt="Vacation"
                />
                <div className="stats-nextVacation-countdown">
                    <div className="stats-nextVacation-time">
                        <div className="stats-nextVacation-time-item">
                            <div className="stats-nextVacation-value">
                                {daysString}
                            </div>
                            <div className="stats-nextVacation-text">days</div>
                        </div>
                        <div className="stats-nextVacation-time-item">
                            <div className="stats-nextVacation-value">
                                {hoursString}
                            </div>
                            <div className="stats-nextVacation-text">hours</div>
                        </div>
                        <div className="stats-nextVacation-time-item">
                            <div className="stats-nextVacation-value">
                                {minutesString}
                            </div>
                            <div className="stats-nextVacation-text">
                                minutes
                            </div>
                        </div>
                    </div>
                    <div className="stats-nextVacation-text">
                        To your vacation
                    </div>
                </div>
            </div>
        );

        return nextVacationComponent;
    };

    return (
        <div className="stats-container">
            <div className="stats-title">Stats</div>
            <div className="stats-vacation-container">
                <div className="stats-vacation-subtitle">Vacation days</div>
                <div className="stats-vacation-days-modify">
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
                    className="stats-progressBar"
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
            <Divider />
            {nextVacation && getNextVacation()}
            {nextVacation && <Divider />}
            <div className="stats-daysAtWork-container">
                <div className="stats-daysAtWork-subtitle">Days at work</div>
                <ProgressBar
                    className="stats-progressBar"
                    now={100}
                    label={`${workDaysAdded} days at work`}
                    variant="success"
                />
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
