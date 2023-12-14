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
const { gcpLogOptions } = require('pino-cloud-logging');

exports.SendEmail = (event, context) => {

  let pubsubType = ""

  const logger = pino(gcpLogOptions(
    {
      level: "info",
      name: 'Sample Alert'
    }
  ));

  logger.warn(context)
  logger.error(event.data)


  const decodedData = Buffer.from(event.data, 'base64').toString('utf-8');
  const parsedData = JSON.parse(decodedData);

  logger.info(parsedData)

  if (parsedData.state != 'FAILED') {
    return;
  }

  if (parsedData.destinationDatasetId) {
    pubsubType = "bqDataTransfer"
  } else {
    pubsubType = "s3ToGcs"
  }

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
    subject: pubsubType === "bqDataTransfer" ? "Failed to Load data into bigquery" : "Failed to load data from S3 to GCS",
    html: `
    <p><b>Error Status:</b></p>
    <p><b>Message:</b> ${parsedData.errorStatus.message}</p>
    <p><b>Code:</b> ${parsedData.errorStatus.code}</p>
  `
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
