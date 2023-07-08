const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmailSendgrid = async (data) => {
    const email = { ...data, from: "enet2611@gmail.com" }
    await sgMail.send(email);
    return true;
}

module.exports = sendEmailSendgrid;