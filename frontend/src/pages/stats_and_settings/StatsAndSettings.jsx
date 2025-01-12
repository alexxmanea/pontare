import "./StatsAndSettings.css";
import Settings from "./settings/Settings";
import Stats from "./stats/Stats";
import TimesheetHistory from "./timesheet_history/TimesheetHistory";

export default function StatsAndSettings() {
    return (
        <div className="statsAndSettings-container">
            <Settings />
            <TimesheetHistory />
            <Stats />
        </div>
    );
}
