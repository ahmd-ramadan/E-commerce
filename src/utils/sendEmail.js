const nodemailer = require('nodemailer');

module.exports.sendEmail = async({to, subject, html}) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: process.env.GMAIL,
            pass: process.env.GMAIL_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.GMAIL,
            to,
            subject,
            html,
        });

        console.log('Email sent: ', info);
        return info.accepted.length > 0;
    } catch (error) {
        console.error('Error sending email: ', error);
        return false;
    }
};