import "./Holidays.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import PUBLIC_HOLIDAYS from "../../../assets/public_holidays.json";

const PUBLIC_HOLIDAYS_URL = "https://www.zileliberelegale.ro/";

const Holidays = () => {
    return (
        <div className="holidays-container">
            <a
                className="holidays-title"
                href={PUBLIC_HOLIDAYS_URL}
                target="_blank"
                rel="noopener noreferrer">
                Public holidays
            </a>
            <div className="holidays-table-container">
                <Table className="holidays-table" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Date</TableCell>
                            <TableCell align="left">Holiday</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {PUBLIC_HOLIDAYS.map((row) => (
                            <TableRow>
                                <TableCell align="left">{row.date}</TableCell>
                                <TableCell align="left">
                                    {row.holiday}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Holidays;
