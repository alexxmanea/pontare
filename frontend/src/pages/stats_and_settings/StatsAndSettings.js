import "./StatsAndSettings.css";
import Settings from "./settings/Settings";
import Stats from "./stats/Stats";

const StatsAndSettings = () => {
    return (
        <div className="statsAndSettings-container">
            <Settings />
            <Stats />
        </div>
    );
};

export default StatsAndSettings;
