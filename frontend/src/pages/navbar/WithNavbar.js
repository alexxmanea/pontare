import Navbar from "./Navbar";
import "./Navbar.css";
import { Outlet } from "react-router-dom";

export default function WithNav() {
    return (
        <div className="page-container">
            <Navbar />
            <div className="content-container">
                <Outlet />
            </div>
        </div>
    );
}
