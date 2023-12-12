/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 * 
 * 
 */
const nodemailer = require('nodemailer');

exports.SendEmail = (event, context) => {
  const message = event.data
    ? Buffer.from(event.data, 'base64').toString()
    : 'Hello, World';
  console.log(message);

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.USER,
    pass: process.env.PASS
  }
});

// Email content
const mailOptions = {
  from: process.env.USER,
  to: 'chandana91madusanka@gmail.com',
  subject: 'Subject of the email',
  text: 'Hello, this is the body of the email!'
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
};
