import "./Login.css";
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
    INVALID_CREDENTIALS,
    SERVER_ERROR,
} from "../../common/RestApi.js";
import { setGlobalState } from "../../common/GlobalState.js";
import { showLoadingScreen } from "../../common/Utils.js";

const Login = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmitLoginInfo = (event) => {
        event.preventDefault();

        const errorMessage = getErrorMessage();
        if (errorMessage) {
            setErrorMessage(errorMessage);
            return;
        }

        showLoadingScreen(setIsLoading, true);

        axios
            .post(`${REST_URL}/api/login`, {
                username: username,
                password: password,
            })
            .then((response) => {
                showLoadingScreen(setIsLoading, false);

                if (response.data === INVALID_CREDENTIALS) {
                    setErrorMessage(getErrorMessage(INVALID_CREDENTIALS));
                    return;
                }
                setErrorMessage(getErrorMessage());

                performLogin();
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

        if (scenario === INVALID_CREDENTIALS) {
            return "Wrong username or password. Please try again.";
        }

        if (!username) {
            return "Username is required.";
        }

        if (!password) {
            return "Password is required.";
        }

        return "";
    };

    const performLogin = () => {
        setGlobalState("authenticatedUser", username);
        navigate("/timesheet");
    };

    return (
        <div className="login-container">
            <div className="login-title">E-Trans Automatic Timesheet</div>
            <TextField
                className="login-username"
                required
                label="Username"
                variant="outlined"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onKeyDown={(event) => {
                    event.key === "Enter" && handleSubmitLoginInfo(event);
                }}
            />
            <TextField
                className="login-password"
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
                            onMouseDown={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <VisibilityOffIcon />
                            ) : (
                                <VisibilityIcon />
                            )}
                        </IconButton>
                    ),
                }}
                onKeyDown={(event) => {
                    event.key === "Enter" && handleSubmitLoginInfo(event);
                }}
            />
            <Alert
                className="login-error"
                severity="error"
                sx={{ visibility: errorMessage ? "visible" : "hidden" }}>
                {errorMessage}
            </Alert>
            <div className="login-submit-container">
                <Button
                    className="login-submit"
                    variant="outlined"
                    onClick={handleSubmitLoginInfo}>
                    Login
                </Button>
                <div>OR</div>
                <Button
                    className="login-register"
                    variant="text"
                    size="small"
                    onClick={() => navigate("/register")}>
                    Create an account
                </Button>
            </div>
            <CircularProgress
                className="login-loading"
                style={{ visibility: isLoading ? "visible" : "hidden" }}
            />
        </div>
    );
};

export default Login;
