import { Navigate } from "react-router-dom";

function getKnownRoute(isAuthenthicated) {
    if (!isAuthenthicated) {
        return "/login";
    }

    return "/dashboard";
}

export default function UnknownRoute() {
    const isAuthenthicated = false;
    const path = getKnownRoute(isAuthenthicated);

    return <Navigate to={path} />;
}
