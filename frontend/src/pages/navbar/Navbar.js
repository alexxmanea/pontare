import "./Navbar.css";
import { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { useGlobalState, setGlobalState } from "../../common/GlobalState.js";

const LOGOUT_TITLE = "Logout";
const LOGOUT_MESSAGE = "Are you sure you want to logout?";

const Navbar = () => {
    const navigate = useNavigate();
    const [authenticatedUser] = useGlobalState("authenticatedUser");
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const performLogout = () => {
        setGlobalState("authenticatedUser", null);
        navigate("/login");
    };

    return (
        <div className="navbar-container">
            <div className="navbar-title">
                Welcome, <b>{authenticatedUser}</b>!
            </div>
            <div className="navbar-buttons">
                <Button onClick={() => navigate("/timesheet")}>
                    Timesheet
                </Button>
                <Button onClick={() => navigate("/stats")}>Stats</Button>
                <Button onClick={() => navigate("/settings")}>Settings</Button>
            </div>
            <Button
                className="navbar-logout"
                onClick={() => setShowLogoutDialog(true)}>
                Logout
            </Button>
            <Dialog
                open={showLogoutDialog}
                onClose={() => () => setShowLogoutDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">
                    {LOGOUT_TITLE}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {LOGOUT_MESSAGE}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowLogoutDialog(false)}>
                        No
                    </Button>
                    <Button onClick={performLogout} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Navbar;
