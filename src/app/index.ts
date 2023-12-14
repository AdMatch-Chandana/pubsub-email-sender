/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 * 
 * 
 */
import * as nodemailer from 'nodemailer';
import { logger } from './logger';
import { EventData } from './types/function.model';

enum PubsubEventTypes {
   "GCS_To_BQ" = 1,
   "S3_to_GCS" = 2,
}

exports.SendEmail = (event: any, context: any) => {

  let eventData: EventData;
  try {
    const decodedData = Buffer.from(event.data, 'base64').toString('utf-8');
    eventData = JSON.parse(decodedData);
  } catch (error) {
    logger.error(error, 'Error decoding or parsing data:');
    return;
  }

  const status = eventData.state || eventData.status;
  if (status !== 'FAILED') {
    return;
  }

  const pubsubType = getEventType(eventData);
  const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: process.env.EMAIL_CLIENT_ID as string,
      pass: process.env.EMAIL_CLIENT_PASSWORD as string
    }
  });

  // Email content
  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.EMAIL_CLIENT_ID as string,
    to: process.env.EMAIL_RECEIVERS as string,
    subject: pubsubType === PubsubEventTypes.GCS_To_BQ ? "BigQuery Data Load Failure" : "S3 to GCS Data Transfer Failure",
    html: getErrorContent(eventData, pubsubType)
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error(error);
    } else {
      logger.info('Email sent: ' + info.response);
    }
  });
};

const getErrorContent = (event: EventData, eventType: PubsubEventTypes): string => {
  if(eventType === PubsubEventTypes.GCS_To_BQ){
    return `
    <p><b>Error Status:</b></p>
    <p><b>Message:</b> ${event.errorStatus.message}</p>
    <p><b>Code:</b> ${event.errorStatus.code}</p>
  `;
  }
  let errorContent = "";
  event.errorBreakdowns.forEach((errorBreakdown, index) => {
    // Add information about each error breakdown to the HTML content
    errorContent += `
      <p><b>Error Breakdown ${index + 1}:</b></p>
      <p><b>Error Count:</b> ${errorBreakdown.errorCount}</p>
      <p><b>Error Code:</b> ${errorBreakdown.errorCode}</p>
      
      <!-- Loop through error log entries -->
      <p><b>Error Log Entries:</b></p>
      <ul>
        ${errorBreakdown.errorLogEntries.map((logEntry, _) => `
          <li>
            <p><b>Error Details:</b> ${logEntry.errorDetails.join(', ')}</p>
            <p><b>URL:</b> ${logEntry.url}</p>
          </li>
        `).join('')}
      </ul>
    `;
  });
  return errorContent;
}

const getEventType = (event: EventData): PubsubEventTypes => {
  if (event.destinationDatasetId) {
    return PubsubEventTypes.GCS_To_BQ;
  }
  return PubsubEventTypes.S3_to_GCS;
};
