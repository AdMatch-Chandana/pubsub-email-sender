import { pino, Logger } from 'pino';
import { gcpLogOptions } from 'pino-cloud-logging';

const LoggerConfig = {
    serviceName: 'gcf-pubsub-email',
    serviceVersion: '1.0.1',
    loggerName: 'storage-transfer-logger',
    minimumLoggerLevel: process.env.LOG_LEVEL || 'info',
};

export const logger = <Logger>pino(
    gcpLogOptions(
        {
            level: LoggerConfig.minimumLoggerLevel,
            name: LoggerConfig.loggerName,
        },
        {
            serviceName: LoggerConfig.serviceName,
            version: LoggerConfig.serviceVersion,
        },
    ),
);
