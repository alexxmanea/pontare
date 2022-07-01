import "./Dashboard.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { Button } from "@mui/material";
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

const moment = extendMoment(Moment);

const INTERVAL_TYPE_WORKDAY = "Workday";
const INTERVAL_TYPE_VACATION = "Vacation";

const Dashboard = () => {
    const [startingWorkday, setStartingWorkday] = useState(null);
    const [endingWorkday, setEndingWorkday] = useState(null);
    const [startingVacation, setStartingVacation] = useState(null);
    const [endingVacation, setEndingVacation] = useState(null);
    const [addedIntervals, setAddedIntervals] = useState([]);

    const addWorkdays = () => {
        let intervals = [];

        if (startingWorkday?.isValid()) {
            intervals.push(startingWorkday);
        }

        if (endingWorkday?.isValid()) {
            if (startingWorkday?.isValid()) {
                if (!startingWorkday.isSame(endingWorkday)) {
                    intervals.push(endingWorkday);
                }
            } else {
                intervals.push(endingWorkday);
            }
        }

        if (!intervals.length) {
            return;
        }

        intervals.sort((a, b) => a.diff(b));

        let newAddedIntervals = [...addedIntervals];

        let isEqual;
        newAddedIntervals.forEach((element) => {
            if (element.type !== INTERVAL_TYPE_WORKDAY) {
                return;
            }

            if (element.interval.length !== intervals.length) {
                return;
            }

            isEqual = true;
            for (let i = 0; i < element.interval.length; i++) {
                if (!element.interval[i].isSame(intervals[i])) {
                    isEqual = false;
                    return;
                }
            }

            if (isEqual) {
                return;
            }
        });

        if (isEqual) {
            setStartingWorkday(null);
            setEndingWorkday(null);
            return;
        }

        let intervalsCopy = intervals.map((interval) => interval.clone());
        if (intervalsCopy.length === 1) {
            intervalsCopy.push(intervalsCopy[0]);
        }
        let collisions = [];
        newAddedIntervals.forEach((element) => {
            // deep copy of element.interval
            let elementIntervals = element.interval.map((interval) =>
                interval.clone()
            );
            if (elementIntervals.length === 1) {
                elementIntervals.push(elementIntervals[0]);
            }

            let range1 = moment.range(intervalsCopy);
            let range2 = moment.range(elementIntervals);

            if (range1.overlaps(range2, { adjacent: true })) {
                collisions.push(element);
            }
        });

        if (collisions.length) {
            console.log(collisions);
            setStartingWorkday(null);
            setEndingWorkday(null);
            return;
        }

        newAddedIntervals.push({
            type: INTERVAL_TYPE_WORKDAY,
            interval: intervals,
        });
        newAddedIntervals.sort((a, b) => a.interval[0].diff(b.interval[0]));

        setAddedIntervals(newAddedIntervals);
        setStartingWorkday(null);
        setEndingWorkday(null);
    };

    const addVacation = () => {
        let intervals = [];

        if (startingVacation?.isValid()) {
            intervals.push(startingVacation);
        }

        if (
            endingVacation?.isValid() &&
            !startingVacation.isSame(endingVacation)
        ) {
            intervals.push(endingVacation);
        }

        if (!intervals.length) {
            return;
        }

        intervals.sort((a, b) => a.diff(b));

        let newAddedIntervals = [...addedIntervals];

        let isEqual;
        newAddedIntervals.forEach((element) => {
            if (element.type !== INTERVAL_TYPE_VACATION) {
                return;
            }

            if (element.interval.length !== intervals.length) {
                return;
            }

            isEqual = true;
            for (let i = 0; i < element.interval.length; i++) {
                if (!element.interval[i].isSame(intervals[i])) {
                    isEqual = false;
                    return;
                }
            }

            if (isEqual) {
                return;
            }
        });

        if (isEqual) {
            setStartingVacation(null);
            setEndingVacation(null);
            return;
        }

        newAddedIntervals.push({
            type: INTERVAL_TYPE_VACATION,
            interval: intervals,
        });
        newAddedIntervals.sort((a, b) => a.interval[0].diff(b.interval[0]));

        setAddedIntervals(newAddedIntervals);
        setStartingVacation(null);
        setEndingVacation(null);
    };

    const removeInterval = (index) => {
        const newIntervals = [...addedIntervals];
        newIntervals.splice(index, 1);
        setAddedIntervals(newIntervals);
    };

    const clearIntervals = () => {
        setAddedIntervals([]);
    };

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
                            inputFormat="DD/MM/yyyy"
                            mask="__/__/____"
                            disableFuture
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
                            inputFormat="DD/MM/yyyy"
                            mask="__/__/____"
                            disableFuture
                            renderInput={(params) => (
                                <TextField fullWidth {...params} />
                            )}
                        />
                        <Button
                            className="dashboard-workdays-item dashboard-workdays-add"
                            variant="contained"
                            onClick={addWorkdays}>
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
                            inputFormat="DD/MM/yyyy"
                            mask="__/__/____"
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
                            inputFormat="DD/MM/yyyy"
                            mask="__/__/____"
                            renderInput={(params) => (
                                <TextField fullWidth {...params} />
                            )}
                        />
                        <Button
                            className="dashboard-workdays-item dashboard-workdays-add"
                            variant="contained"
                            onClick={addVacation}>
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
                                    {row.interval
                                        .map((interval) =>
                                            interval.format("DD/MM/yyyy")
                                        )
                                        .join(" - ")}
                                </TableCell>
                                <TableCell align="left">{row.type}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Button className="dashboard-submit" variant="contained">
                Submit timesheet
            </Button>
        </div>
    );
};

export default Dashboard;
