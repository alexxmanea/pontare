import "./Dashboard.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ClearIcon from "@mui/icons-material/Clear";
import ReplayIcon from "@mui/icons-material/Replay";
import Moment from "moment";
import { extendMoment } from "moment-range";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import axios from "axios";
import { REST_URL } from "../../../common/RestApi.js";

const moment = extendMoment(Moment);
moment.locale("en", {
    week: {
        dow: 1,
    },
});

const DAY_TYPES = { workday: "Workday", vacation: "Vacation" };
const DATE_FORMAT = "DD/MM/YYYY";

const Dashboard = () => {
    const [startingWorkday, setStartingWorkday] = useState(null);
    const [endingWorkday, setEndingWorkday] = useState(null);
    const [startingVacation, setStartingVacation] = useState(null);
    const [endingVacation, setEndingVacation] = useState(null);
    const [addedIntervals, setAddedIntervals] = useState([]);
    const [collisionsDialogMessage, setCollisionsDialogMessage] = useState([]);
    const [submitTimesheetDialogMessage, setSubmitTimesheetDialogMessage] =
        useState([]);
    const [
        waitingToSubmitTimesheetDialogMessage,
        setWaitingToSubmitTimesheetDialogMessage,
    ] = useState([]);

    const isValidInterval = (startingDay, endingDay) => {
        return startingDay?.isValid() || endingDay?.isValid();
    };

    const addInterval = (
        startingDay,
        setStartingDay,
        endingDay,
        setEndingDay,
        dayType
    ) => {
        let intervalToAdd = [];

        if (startingDay?.isValid()) {
            intervalToAdd.push(startingDay);
        }

        if (endingDay?.isValid()) {
            if (startingDay?.isValid()) {
                if (!startingDay.isSame(endingDay)) {
                    intervalToAdd.push(endingDay);
                }
            } else {
                intervalToAdd.push(endingDay);
            }
        }

        if (!intervalToAdd.length) {
            return;
        }

        intervalToAdd.sort((a, b) => a.diff(b));

        let addedIntervalsCopy = [...addedIntervals];

        let intervalToAddCopy = intervalToAdd.map((interval) =>
            interval.clone()
        );
        if (intervalToAddCopy.length === 1) {
            intervalToAddCopy.push(intervalToAddCopy[0]);
        }
        let collisions = [];
        addedIntervalsCopy.forEach((element) => {
            let elementIntervals = element.interval.map((interval) =>
                interval.clone()
            );
            if (elementIntervals.length === 1) {
                elementIntervals.push(elementIntervals[0]);
            }

            let range1 = moment.range(intervalToAddCopy);
            let range2 = moment.range(elementIntervals);

            if (range1.overlaps(range2, { adjacent: true })) {
                collisions.push(element);
            }
        });

        if (collisions.length) {
            setCollisionsDialogMessage(
                composeCollisionsDialogMessage(
                    collisions,
                    intervalToAddCopy,
                    dayType
                )
            );
            return;
        }

        addedIntervalsCopy.push({
            type: dayType,
            interval: intervalToAdd,
        });
        addedIntervalsCopy.sort((a, b) => a.interval[0].diff(b.interval[0]));

        setAddedIntervals(addedIntervalsCopy);
        setStartingDay(null);
        setEndingDay(null);
    };

    const removeInterval = (index) => {
        const newIntervals = [...addedIntervals];
        newIntervals.splice(index, 1);
        setAddedIntervals(newIntervals);
    };

    const clearIntervals = () => {
        setAddedIntervals([]);
    };

    const composeCollisionsDialogMessage = (
        collisions,
        intervalToAdd,
        dayType
    ) => {
        let message = [];
        message.push(
            <Typography
                style={{
                    marginBottom: "1rem",
                }}>{`The interval you are trying to add (${parseIntervalToString(
                intervalToAdd
            )}) (${dayType}) collides with the following existing intervals:`}</Typography>
        );
        collisions.forEach((collision) => {
            message.push(
                <Typography>{`- ${parseIntervalToString(collision.interval)} (${
                    collision.type
                })`}</Typography>
            );
        });
        return message;
    };

    const composeSubmitTimesheetDialogMessage = () => {
        let message = [];
        message.push(
            <Typography>
                Are you sure you want to submit the following Timesheet?
            </Typography>
        );
        message.push(
            <Typography style={{ marginBottom: "1rem" }}>
                This action is irreversible, so you have to manually remove
                submitted days from <b>E-Trans</b>.
            </Typography>
        );
        addedIntervals.forEach((row) => {
            message.push(
                <Typography>{`- ${parseIntervalToString(row.interval)} (${
                    row.type
                })`}</Typography>
            );
        });
        return message;
    };

    const parseIntervalToString = (interval) => {
        const intervalString = interval
            .map((interval) => interval.format(DATE_FORMAT))
            .join(" - ");
        return intervalString;
    };

    const disableWeekends = (momentValue) => {
        return momentValue.isoWeekday() === 6 || momentValue.isoWeekday() === 7;
    };

    const clearDatePickers = () => {
        setStartingWorkday(null);
        setEndingWorkday(null);
        setStartingVacation(null);
        setEndingVacation(null);
    };

    const submitTimesheet = () => {
        axios
            .post(`${REST_URL}/api/submittimesheet`, {
                timesheet: addedIntervals,
            })
            .then((response) => {
                console.log(response);
                setWaitingToSubmitTimesheetDialogMessage(
                    composeTimesheetSubmittedDialogMessage(true)
                );
                // if (response.data === USER_EXISTS) {
                //     setErrorMessage(getErrorMessage(USER_EXISTS));
                //     return;
                // }

                // setErrorMessage(getErrorMessage());
                // setShowRegisteredDialog(true);
            })
            .catch((error) => {
                // setErrorMessage(getErrorMessage(SERVER_ERROR));
                console.log(error);
                setWaitingToSubmitTimesheetDialogMessage(
                    composeTimesheetSubmittedDialogMessage(false)
                );
            });

        setWaitingToSubmitTimesheetDialogMessage(
            composeWaitingToSubmitTimesheetDialogMessage()
        );
        // clearDatePickers();
        // clearIntervals();
        setSubmitTimesheetDialogMessage([]);
    };

    const composeWaitingToSubmitTimesheetDialogMessage = () => {
        let message = [];
        message.push(
            <Typography style={{ marginBottom: "1rem" }}>
                Your Timesheet is submitting. Please wait...
            </Typography>
        );
        message.push(
            <div className="dashboard-submit-loading">
                <CircularProgress />
            </div>
        );
        console.log(message);
        return message;
    };

    const composeTimesheetSubmittedDialogMessage = (hasSucceeded) => {
        let text = hasSucceeded
            ? "Your Timesheet has been submitted successfully."
            : "An error occurred while submitting your Timesheet. Please try again later.";
        let message = [];
        message.push(<Typography>{text}</Typography>);
        return message;
    };

    const a = waitingToSubmitTimesheetDialogMessage[0]?.props?.children;
    let b = "";

    return (
        <div className="dashboard-container">
            <LocalizationProvider dateAdapter={AdapterMoment}>
                <div className="dashboard-title">Timesheet</div>
                <div className="dashboard-workdays-container">
                    <div className="dashboard-subtitle">Workdays interval</div>
                    <div className="dashboard-workdays-interval">
                        <DesktopDatePicker
                            className="dashboard-workdays-item"
                            label="Starting workday"
                            value={startingWorkday}
                            onChange={setStartingWorkday}
                            inputFormat={DATE_FORMAT}
                            mask="__/__/____"
                            disableFuture
                            shouldDisableDate={disableWeekends}
                            renderInput={(params) => (
                                <TextField fullWidth {...params} />
                            )}
                        />
                        <div>TO</div>
                        <DesktopDatePicker
                            className="dashboard-workdays-item"
                            label="Ending workday"
                            value={endingWorkday}
                            onChange={setEndingWorkday}
                            inputFormat={DATE_FORMAT}
                            mask="__/__/____"
                            disableFuture
                            shouldDisableDate={disableWeekends}
                            renderInput={(params) => (
                                <TextField fullWidth {...params} />
                            )}
                        />
                        <Button
                            className="dashboard-workdays-item dashboard-workdays-add"
                            variant="contained"
                            disabled={
                                !isValidInterval(startingWorkday, endingWorkday)
                            }
                            onClick={() =>
                                addInterval(
                                    startingWorkday,
                                    setStartingWorkday,
                                    endingWorkday,
                                    setEndingWorkday,
                                    DAY_TYPES.workday
                                )
                            }>
                            Add workdays
                        </Button>
                    </div>
                </div>
                <div className="dashboard-workdays-container">
                    <div className="dashboard-subtitle">Vacation interval</div>
                    <div className="dashboard-workdays-interval">
                        <DesktopDatePicker
                            className="dashboard-workdays-item"
                            label="Starting vaction"
                            value={startingVacation}
                            onChange={setStartingVacation}
                            inputFormat={DATE_FORMAT}
                            mask="__/__/____"
                            shouldDisableDate={disableWeekends}
                            renderInput={(params) => (
                                <TextField fullWidth {...params} />
                            )}
                        />
                        <div>TO</div>
                        <DesktopDatePicker
                            className="dashboard-workdays-item"
                            label="Ending vaction"
                            value={endingVacation}
                            onChange={setEndingVacation}
                            inputFormat={DATE_FORMAT}
                            mask="__/__/____"
                            shouldDisableDate={disableWeekends}
                            renderInput={(params) => (
                                <TextField fullWidth {...params} />
                            )}
                        />
                        <Button
                            className="dashboard-workdays-item dashboard-workdays-add"
                            variant="contained"
                            disabled={
                                !isValidInterval(
                                    startingVacation,
                                    endingVacation
                                )
                            }
                            onClick={() =>
                                addInterval(
                                    startingVacation,
                                    setStartingVacation,
                                    endingVacation,
                                    setEndingVacation,
                                    DAY_TYPES.vacation
                                )
                            }>
                            Add vacation
                        </Button>
                    </div>
                </div>
            </LocalizationProvider>
            <div className="dashboard-subtitle">Added intervals</div>
            <div className="dashboard-intervals-table-container">
                <Table className="dashboard-intervals-table" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" width={"1px"}>
                                <Tooltip
                                    title="Delete all intervals"
                                    placement="top">
                                    <IconButton onClick={clearIntervals}>
                                        <ReplayIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                            <TableCell align="left">Date</TableCell>
                            <TableCell align="left">Type</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {addedIntervals?.map((row, index) => (
                            <TableRow>
                                <TableCell align="left">
                                    <Tooltip
                                        title="Delete interval"
                                        placement="top">
                                        <IconButton
                                            onClick={() =>
                                                removeInterval(index)
                                            }>
                                            <ClearIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                <TableCell align="left">
                                    {parseIntervalToString(row.interval)}
                                </TableCell>
                                <TableCell align="left">{row.type}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Button
                className="dashboard-submit"
                variant="contained"
                disabled={!addedIntervals.length}
                onClick={() => {
                    setSubmitTimesheetDialogMessage(
                        composeSubmitTimesheetDialogMessage()
                    );
                }}>
                Submit timesheet
            </Button>
            <Dialog
                open={collisionsDialogMessage.length}
                disableBackdropClick
                disableEscapeKeyDown>
                <DialogTitle>Intervals collide</DialogTitle>
                <DialogContent>{collisionsDialogMessage}</DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setCollisionsDialogMessage([])}
                        autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={submitTimesheetDialogMessage.length}
                disableBackdropClick
                disableEscapeKeyDown>
                <DialogTitle>Submit Timesheet</DialogTitle>
                <DialogContent>{submitTimesheetDialogMessage}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setSubmitTimesheetDialogMessage([])}>
                        No
                    </Button>
                    <Button onClick={submitTimesheet} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={waitingToSubmitTimesheetDialogMessage.length}
                disableBackdropClick
                disableEscapeKeyDown>
                <DialogTitle>Submit Timesheet</DialogTitle>
                <DialogContent>
                    {waitingToSubmitTimesheetDialogMessage}
                </DialogContent>
                {(waitingToSubmitTimesheetDialogMessage[0]?.props?.children.includes(
                    "success"
                ) ||
                    waitingToSubmitTimesheetDialogMessage[0]?.props?.children.includes(
                        "error"
                    )) && (
                    <DialogActions>
                        <Button
                            autoFocus
                            onClick={() =>
                                setWaitingToSubmitTimesheetDialogMessage([])
                            }>
                            OK
                        </Button>
                    </DialogActions>
                )}
            </Dialog>
        </div>
    );
};

export default Dashboard;
