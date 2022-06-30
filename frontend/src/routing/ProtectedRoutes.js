import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoutes() {
    const isAuthenticated = true;

    return isAuthenticated ? <Outlet /> : <Navigate to={"/login"} />;
}
