/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 * 
 * 
 */
const nodemailer = require('nodemailer');

const { Logger, pino } = require('pino');
const {gcpLogOptions}  = require('pino-cloud-logging');

exports.SendEmail = (event, context) => {

  const logger = pino(gcpLogOptions(
    {
        level: "info",
        name: 'Sample Alert'
    }
));

logger.info(event)

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
  to: process.env.EMAIL_RECEIVERS,
  subject: process.env.SUBJECT,
  text: process.env.CONTENT
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
