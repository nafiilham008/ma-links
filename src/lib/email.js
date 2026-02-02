import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'mail.malinks.web.id',
            port: Number(process.env.SMTP_PORT) || 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Ma-Links" <admin@malinks.web.id>',
            to,
            subject,
            html,
        });

        // console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}
