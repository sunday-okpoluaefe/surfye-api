const nodeMailer = require('nodemailer');

let transporter = nodeMailer.createTransport({
  host: 'smtp.zoho.com',
  secure: true,
  port: 465,
  auth: {
    user: process.env.ZOHO_USERNAME,
    pass: process.env.ZOHO_PASSWORD,
  },
});

const api = {};

let buildBody = () => {
  const mailOptions = {
    from: 'email@domain.com', // sender address
    to: 'email@somedomain.com',
    subject: 'Some subject', // Subject line
    html: <p>test</p>, // plain text body
  };
};

api.send = async (data) => {

};

module.exports.Email = api;
