import nodemailer from "nodemailer";
import EMAIL_CREDENTIALS from "../../secure/email_credentials.json" assert { type: "json" };

export const sendEmailNotification = async (data, emailData) => {
    if (
        data.emailSubscription !== true ||
        data.email === undefined ||
        data.email === null ||
        !data.email?.length
    ) {
        return;
    }

    const transporter = nodemailer.createTransport({
        host: "mail.inovium.ro",
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_CREDENTIALS.username,
            pass: EMAIL_CREDENTIALS.password,
        },
    });

    const mailOptions = {
        from: `Pontare <${EMAIL_CREDENTIALS.username}>`,
        to: data.email,
        subject: emailData.subject,
        text: emailData.body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
    });
};
