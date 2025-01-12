import "./Register.css";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    REST_URL,
    INVALID_TIMESHEET_CREDENTIALS,
    SERVER_ERROR,
    USER_EXISTS,
} from "../../common/RestApi.js";
import { isValidEmail, isEximprodEmail } from "../../common/Utils.js";
import { showLoadingScreen } from "../../common/Utils.js";

const SUCCESSFULLY_REGISTERED_TITLE = "Register";
const SUCCESSFULLY_REGISTERED_MESSAGE =
    "Your account has been successfully created. Proceed to login.";

export default function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showRegisteredDialog, setShowRegisteredDialog] = useState(false);

    const handleSubmitRegisterInfo = (event) => {
        event.preventDefault();

        const errorMessage = getErrorMessage();
        if (errorMessage) {
            setErrorMessage(errorMessage);
            return;
        }

        showLoadingScreen(setIsLoading, true);

        axios
            .post(`${REST_URL}/api/register`, {
                username: username,
                password: password,
                email: email,
            })
            .then((response) => {
                showLoadingScreen(setIsLoading, false);

                if (response.data === USER_EXISTS) {
                    setErrorMessage(getErrorMessage(USER_EXISTS));
                    return;
                }
                if (response.data === INVALID_TIMESHEET_CREDENTIALS) {
                    setErrorMessage(
                        getErrorMessage(INVALID_TIMESHEET_CREDENTIALS)
                    );
                    return;
                }

                setErrorMessage(getErrorMessage());
                setShowRegisteredDialog(true);
            })
            .catch((error) => {
                showLoadingScreen(setIsLoading, false);
                setErrorMessage(getErrorMessage(SERVER_ERROR));
            });
    };

    const getErrorMessage = (scenario = "") => {
        if (scenario === SERVER_ERROR) {
            return "Server error. Please try again.";
        }

        if (scenario === USER_EXISTS) {
            return "An account with this username/email already exists.";
        }

        if (scenario === INVALID_TIMESHEET_CREDENTIALS) {
            return "Wrong E-Trans username or password. Try Again.";
        }

        if (!username) {
            return "Username is required.";
        }

        if (!password) {
            return "Password is required.";
        }

        if (!email) {
            return "Email is required.";
        }

        if (!isValidEmail(email)) {
            return "Invalid email.";
        }

        if (!isEximprodEmail(email)) {
            return "You must register using you @epg.ro or @eximprod.ro email.";
        }

        return "";
    };

    return (
        <div className="register-container">
            <div className="register-title">E-Trans Automatic Timesheet</div>
            <TextField
                className="register-username"
                required
                label="Username"
                variant="outlined"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onKeyDown={(event) => {
                    event.key === "Enter" && handleSubmitRegisterInfo(event);
                }}
            />
            <TextField
                className="register-password"
                required
                label="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                InputProps={{
                    endAdornment: (
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <VisibilityOffIcon />
                            ) : (
                                <VisibilityIcon />
                            )}
                        </IconButton>
                    ),
                }}
                onKeyDown={(event) => {
                    event.key === "Enter" && handleSubmitRegisterInfo(event);
                }}
            />
            <TextField
                className="register-email"
                required
                label="Eximprod Email"
                variant="outlined"
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                    event.key === "Enter" && handleSubmitRegisterInfo(event);
                }}
            />
            <Alert
                className="register-error"
                severity="error"
                sx={{ visibility: errorMessage ? "visible" : "hidden" }}
            >
                {errorMessage}
            </Alert>
            <div className="register-submit-container">
                <Button
                    className="register-submit"
                    variant="contained"
                    onClick={handleSubmitRegisterInfo}
                >
                    Register
                </Button>
                <div>OR</div>
                <Button
                    className="register-login"
                    variant="text"
                    onClick={() => navigate("/login")}
                >
                    Login with an existing account
                </Button>
            </div>
            <CircularProgress
                className="register-loading"
                style={{ visibility: isLoading ? "visible" : "hidden" }}
            />
            <Dialog open={showRegisteredDialog}>
                <DialogTitle>{SUCCESSFULLY_REGISTERED_TITLE}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {SUCCESSFULLY_REGISTERED_MESSAGE}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => navigate("/login")} autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
