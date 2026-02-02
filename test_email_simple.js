const nodemailer = require('nodemailer');

async function main() {
    // Try using the host found in the certificate error
    const host = 'mx5.mailspace.id';
    const user = 'support@malinks.web.id';
    const pass = 'P@ssw0rd123!';

    console.log(`Testing connection to ${host}...`);

    const transporter = nodemailer.createTransport({
        host: host,
        port: 465,
        secure: true,
        auth: { user, pass }
    });

    try {
        await transporter.verify();
        console.log('✅ Connection Successful!');

        // Optional: Try sending
        /*
        const info = await transporter.sendMail({
            from: '"Test" <support@malinks.web.id>',
            to: 'support@malinks.web.id', // Self-test
            subject: 'SMTP Test',
            text: 'It works!'
        });
        console.log("Message sent:", info.messageId);
        */
    } catch (err) {
        console.error('❌ Connection Failed:', err);
    }
}

main();
