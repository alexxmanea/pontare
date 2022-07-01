import { Navigate, Outlet } from "react-router-dom";
import { useGlobalState } from "../common/GlobalState";

export default function ProtectedRoutes() {
    const [authenticatedUser] = useGlobalState("authenticatedUser");

    return authenticatedUser !== null ? <Outlet /> : <Navigate to={"/login"} />;
}
