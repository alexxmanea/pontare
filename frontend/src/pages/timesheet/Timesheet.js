import "./Timesheet.css";
import Dashboard from "./dashboard/Dashboard";
import Holidays from "./holidays/Holidays";

const Timesheet = () => {
    return (
        <div className="timesheet-container">
            <Dashboard />
            <Holidays />
        </div>
    );
};

export default Timesheet;
