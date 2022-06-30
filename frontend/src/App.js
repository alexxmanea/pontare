import "./App.css";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Dashboard from "./pages/dashboard/Dashboard";
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
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>
                <Route path="*" element={<UnknownRoute />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
