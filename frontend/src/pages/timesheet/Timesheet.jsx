import "./Timesheet.css";
import Dashboard from "./dashboard/Dashboard";
import Holidays from "./holidays/Holidays";

export default function Timesheet() {
    return (
        <div className="timesheet-container">
            <Dashboard />
            <Holidays />
        </div>
    );
};
