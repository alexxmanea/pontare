import "./App.css";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import WithNavbar from "./pages/navbar/WithNavbar";
import Timesheet from "./pages/timesheet/Timesheet";
import StatsAndSettings from "./pages/stats_and_settings/StatsAndSettings";
import Team from "./pages/team/Team";
import "@fontsource/roboto";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./routing/ProtectedRoutes";
import UnknownRoute from "./routing/UnknownRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoutes />}>
                    <Route element={<WithNavbar />}>
                        <Route path="/timesheet" element={<Timesheet />} />
                        <Route
                            path="/stats-settings"
                            element={<StatsAndSettings />}
                        />
                        <Route path="/team" element={<Team />} />
                    </Route>
                </Route>
                <Route path="*" element={<UnknownRoute />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
