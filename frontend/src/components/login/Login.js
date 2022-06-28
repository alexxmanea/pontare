import "./Login.css";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="login-container">
            <TextField
                className="login-username"
                label="Username"
                variant="outlined"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
            />
            <TextField
                className="login-password"
                label="Password"
                variant="outlined"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />
            <Button variant="outlined">Login</Button>
            <div>OR</div>
            <Button variant="text" size="small">Create an account</Button>
        </div>
    );
};

export default Login;
