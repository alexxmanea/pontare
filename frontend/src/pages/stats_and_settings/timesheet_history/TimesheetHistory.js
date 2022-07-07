import "./TimesheetHistory.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useState, useEffect } from "react";
import { useGlobalState } from "../../../common/GlobalState";
import axios from "axios";
import { REST_URL } from "../../../common/RestApi";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import { DAY_TYPES } from "../../../common/Constants";

const TimesheetHistory = () => {
    const [userId] = useGlobalState("userId");
    const [timesheetHistory, setTimesheetHistory] = useState(null);
    const [dialogFields, setDialogFields] = useState(null);

    useEffect(() => {
        axios
            .get(`${REST_URL}/api/timesheethistory`, {
                params: {
                    userId: userId,
                },
            })
            .then((response) => {
                const data = response.data;
                data.timesheetHistory &&
                    setTimesheetHistory(sortTimesheetHistory(data.timesheetHistory));
            })
            .catch((error) => {
                setDialogFields({
                    title: "Timesheet history",
                    content: "Server error. Please try again.",
                });
            });
    }, []);

    const sortTimesheetHistory = (
        timesheetHistory,
        property = "startingDay"
    ) => {
        const timesheetHistoryCopy = [...timesheetHistory];

        return timesheetHistoryCopy.sort((a, b) => {
            if (a[property] < b[property]) {
                return -1;
            }
            if (a[property] > b[property]) {
                return 1;
            }
            return 0;
        });
    };

    return (
        <div className="timeSheetHistory-container">
            <div className="timeSheetHistory-title">Timesheet history</div>
            <div className="timesheetHistory-table-container">
                <Table className="timesheetHistory-table" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                className="timesheetHistory-table-header-cell"
                                align="left">
                                Starting day
                            </TableCell>
                            <TableCell
                                className="timesheetHistory-table-header-cell"
                                align="left">
                                Ending day
                            </TableCell>
                            <TableCell
                                className="timesheetHistory-table-header-cell"
                                align="left">
                                Days used
                            </TableCell>
                            <TableCell
                                className="timesheetHistory-table-header-cell"
                                align="left">
                                Type
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timesheetHistory?.map((row, index) => (
                            <TableRow
                                key={`timesheetHistory-table-row-${index}`}>
                                <TableCell align="left">
                                    {row.startingDay}
                                </TableCell>
                                <TableCell align="left">
                                    {row.endingDay === null
                                        ? "-"
                                        : row.endingDay}
                                </TableCell>
                                <TableCell align="left">
                                    {row.type === DAY_TYPES.vacation
                                        ? row.daysUsed
                                        : "-"}
                                </TableCell>
                                <TableCell align="left">{row.type}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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

export default TimesheetHistory;
