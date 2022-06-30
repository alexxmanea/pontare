import "./Register.css";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    REST_URL,
    INVALID_TIMESHEET_CREDENTIALS,
    SERVER_ERROR,
    USER_EXISTS,
} from "../../common/RestApi.js";
import { isValidEmail, isInoviumEmail } from "../../common/Utils.js";

const Register = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    const handleSubmitRegisterInfo = (event) => {
        event.preventDefault();

        const errorMessage = getErrorMessage();
        if (errorMessage) {
            setErrorMessage(errorMessage);
            return;
        }

        showLoadingScreen(true);

        axios
            .post(`${REST_URL}/api/register`, {
                username: username,
                password: password,
                email: email,
            })
            .then((response) => {
                showLoadingScreen(false);

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
            })
            .catch((error) => {
                showLoadingScreen(false);
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

        if (!isInoviumEmail(email)) {
            return "You must register using you Inovium.ro email.";
        }

        return "";
    };

    const showLoadingScreen = (value) => {
        setIsLoading(value);
        if (value) {
            document.getElementsByTagName("body")[0].style =
                "pointer-events: none";
        } else {
            let body = document.getElementsByTagName("body")[0];
            body.style.removeProperty("pointer-events");
        }
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
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}>
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
                label="Inovium Email"
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
                sx={{ visibility: errorMessage ? "visible" : "hidden" }}>
                {errorMessage}
            </Alert>
            <div className="register-submit-container">
                <Button
                    className="register-submit"
                    variant="outlined"
                    onClick={handleSubmitRegisterInfo}>
                    Register
                </Button>
                <div>OR</div>
                <Button
                    className="register-login"
                    variant="text"
                    size="small"
                    onClick={() => navigate("/login")}>
                    Login with an existing account
                </Button>
            </div>
            <CircularProgress
                className="register-loading"
                style={{ visibility: isLoading ? "visible" : "hidden" }}
            />
        </div>
    );
};

export default Register;
