import "./App.css";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import WithNavbar from "./pages/navbar/WithNavbar";
import Timesheet from "./pages/timesheet/Timesheet";
import Stats from "./pages/stats/Stats";
import Settings from "./pages/settings/Settings";
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
                        <Route path="/stats" element={<Stats />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Route>
                <Route path="*" element={<UnknownRoute />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
