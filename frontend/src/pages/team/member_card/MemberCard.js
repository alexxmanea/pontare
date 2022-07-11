import "./MemberCard.css";
import axios from "axios";
import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import moment from "moment";
import { DATE_FORMAT } from "../../../common/Constants";

const PHOTO_URL = "https://dog.ceo/api/breeds/image/random";
const USER_STATUS = {
    working: { status: "Working", className: "working", severity: "success" },
    vacation: {
        status: "Vacation",
        className: "vacation",
        severity: "warning",
    },
    notRegistered: {
        status: "Not registered yet",
        className: "notRegistered",
        severity: "error",
    },
};

const MemberCard = ({ data }) => {
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        axios
            .get(PHOTO_URL)
            .then((response) => {
                setPhoto(response.data.message);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const getName = (email) => {
        const fullName = email.split("@")[0];
        let firstName = fullName.split(".")[0];
        let lastName = fullName.split(".")[1];

        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

        return `${firstName} ${lastName}`;
    };

    const getUserStatus = () => {
        if (!data.isRegistered) {
            return USER_STATUS.notRegistered;
        }

        const today = moment();
        let vacationStart = moment(data.vacationStart, DATE_FORMAT);
        vacationStart.set({
            hour: 0,
            minute: 0,
            second: 0,
        });
        let vacationEnd = moment(data.vacationEnd, DATE_FORMAT);
        vacationEnd.set({
            hour: 0,
            minute: 0,
            second: 0,
        });

        if (today.isBetween(vacationStart, vacationEnd)) {
            return USER_STATUS.vacation;
        }

        return USER_STATUS.working;
    };

    return (
        <div className="memberCard-container">
            <div className="memberCard-details-container">
                <img
                    className={`memberCard-photo memberCard-photo-${
                        getUserStatus().className
                    }`}
                    src={photo}
                    alt="Profile picture"
                />
                <div className="memberCard-details">
                    <div className="memberCard-name">{getName(data.email)}</div>
                    <div className="memberCard-email">{data.email}</div>
                    {data.isRegistered && (
                        <div className="memberCard-status">
                            Status: <b>{getUserStatus().status}</b>
                        </div>
                    )}
                </div>
            </div>
            <div className="memberCard-other">
                <Alert
                    className="memberCard-alert"
                    severity={getUserStatus().severity}>
                    {getUserStatus().status}
                </Alert>
            </div>
        </div>
    );
};

export default MemberCard;
