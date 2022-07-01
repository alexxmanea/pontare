import { Navigate } from "react-router-dom";
import { useGlobalState } from "../common/GlobalState";

function getKnownRoute(authenticatedUser) {
    if (authenticatedUser === null) {
        return "/login";
    }

    return "/timesheet";
}

export default function UnknownRoute() {
    const [authenticatedUser] = useGlobalState("authenticatedUser");
    const path = getKnownRoute(authenticatedUser);

    return <Navigate to={path} />;
}
