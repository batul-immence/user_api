require('dotenv').config()
var nodemailer = require('nodemailer')

module.exports = (email, subject, html) => {
    var transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    })

    var mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: subject,
        html: html,
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
}