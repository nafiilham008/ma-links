export async function sendEmail({ to, subject, html }) {
    console.log("========================================");
    console.log(`📧 SENDING EMAIL TO: ${to}`);
    console.log(`UNKNOWN SUBJECT: ${subject}`);
    console.log("----------------------------------------");
    console.log(html); // In production, use nodemailer or Resend
    console.log("========================================");
    return true;
}
