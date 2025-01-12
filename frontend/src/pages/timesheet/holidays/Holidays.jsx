import "./Holidays.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PUBLIC_HOLIDAYS from "../../../assets/public_holidays.json";

const PUBLIC_HOLIDAYS_URL = "https://www.zileliberelegale.ro/";
const PUBLIC_HOLIDAYS_SOURCE = "Source: zileliberelegale.ro";

export default function Holidays() {
    return (
        <div className="holidays-container">
            <Tooltip title={PUBLIC_HOLIDAYS_SOURCE} placement="top">
                <IconButton
                    className="holidays-source"
                    onClick={() => {
                        window.open(
                            PUBLIC_HOLIDAYS_URL,
                            "_blank",
                            "noopener,noreferrer"
                        );
                    }}
                >
                    <InfoOutlinedIcon />
                </IconButton>
            </Tooltip>
            <div className="holidays-title">Public holidays</div>
            <div className="holidays-table-container">
                <Table className="holidays-table" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Date</TableCell>
                            <TableCell align="left">Holiday</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {PUBLIC_HOLIDAYS.map((row, index) => (
                            <TableRow key={`holidays-table-row-${index}`}>
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
}
