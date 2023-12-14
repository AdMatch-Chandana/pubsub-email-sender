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

  logger.info(event)
  logger.error(event.data)


  const decodedData = Buffer.from(event.data, 'base64').toString('utf-8');
  const parsedData = JSON.parse(decodedData);

  logger.info(parsedData)

  const status = parsedData.state || parsedData.status;
  let htmlContent;
  if (status != 'FAILED') {
    return;
  }

  if (parsedData.destinationDatasetId) {
    pubsubType = "bqDataTransfer"
    htmlContent = `
    <p><b>Error Status:</b></p>
    <p><b>Message:</b> ${parsedData.errorStatus.message}</p>
    <p><b>Code:</b> ${parsedData.errorStatus.code}</p>
  `
  } else {
    pubsubType = "s3ToGcs"
    parsedData.errorBreakdowns.forEach((errorBreakdown, index) => {
      // Add information about each error breakdown to the HTML content
      htmlContent += `
        <p><b>Error Breakdown ${index + 1}:</b></p>
        <p><b>Error Count:</b> ${errorBreakdown.errorCount}</p>
        <p><b>Error Code:</b> ${errorBreakdown.errorCode}</p>
        
        <!-- Loop through error log entries -->
        <p><b>Error Log Entries:</b></p>
        <ul>
          ${errorBreakdown.errorLogEntries.map((logEntry, logIndex) => `
            <li>
              <p><b>Error Details:</b> ${logEntry.errorDetails.join(', ')}</p>
              <p><b>URL:</b> ${logEntry.url}</p>
            </li>
          `).join('')}
        </ul>
      `;
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: "thilhani91senavirathne@outlook.com",
      pass: "peraCHA123@"
    }
  });

  // Email content
  const mailOptions = {
    from: "thilhani91senavirathne@outlook.com",
    to: process.env.EMAIL_RECEIVERS,
    subject: pubsubType === "bqDataTransfer" ? "Failed to Load data into bigquery" : "Failed to load data from S3 to GCS",
    html: htmlContent
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
