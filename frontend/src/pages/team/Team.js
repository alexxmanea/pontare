import "./Team.css";
import "./member_card/MemberCard";
import MemberCard from "./member_card/MemberCard";
import { useState, useEffect } from "react";
import axios from "axios";
import { REST_URL } from "../../common/RestApi";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { Button } from "@mui/material";
import { useGlobalState } from "../../common/GlobalState";

const Team = () => {
    const [members, setMembers] = useState([]);
    const [dialogFields, setDialogFields] = useState(null);
    const [userId] = useGlobalState("userId");

    useEffect(() => {
        axios
            .get(`${REST_URL}/api/team`, {
                params: {
                    userId: userId,
                },
            })
            .then((response) => {
                const data = response.data;
                data.team &&
                    data.team.length > 0 &&
                    setMembers([...data.team]);
            })
            .catch((error) => {
                setDialogFields({
                    title: "Team",
                    content: "Server error. Please try again.",
                });
            });
    }, []);

    return (
        <div className="team-container">
            {members &&
                members.length &&
                members.map((memberData, index) => {
                    return (
                        <MemberCard
                            key={`memberCard-${index}`}
                            data={memberData}
                        />
                    );
                })}
            <Dialog open={dialogFields !== null}>
                <DialogTitle>{dialogFields?.title}</DialogTitle>
                <DialogContent>{dialogFields?.content}</DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => setDialogFields(null)}>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Team;
