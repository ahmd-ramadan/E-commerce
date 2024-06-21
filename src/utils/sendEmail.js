const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

module.exports.sendEmail = async ({ to, subject, linkTo, fileName }) => {
    try {
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

        const templatePath = path.join(__dirname, '..', 'views', fileName);
        const emailHTML = await ejs.renderFile(templatePath, { linkTo });

        const renderedEmail = await ejs.renderFile(
            path.join(__dirname, '..', 'views', 'layout.ejs'),
            { content: emailHTML }
        );

        const info = await transporter.sendMail({
            from: process.env.GMAIL,
            to,
            subject,
            html: renderedEmail
        });

        console.log('Email sent: ', info);
        return info.accepted.length > 0;
    } catch (error) {
        console.error('Error sending email: ', error);
        return false;
    }
};