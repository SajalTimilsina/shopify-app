// src/utils/logger.js

import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

import fs from 'fs';

// Ensure the log directory exists


// Define custom log formats
const logFormat = format.printf(({ timestamp, level, message, metadata }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
        metadata && Object.keys(metadata).length ? JSON.stringify(metadata) : ''
    }`;
});

// Define the log directory
const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Configure transports based on the environment
const loggerTransports = [
    // Console transport for development
    new transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat
        ),
    }),
];

// In production, add file transports
if (process.env.NODE_ENV === 'production') {
    loggerTransports.push(
        // Error logs
        new transports.DailyRotateFile({
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: format.combine(
                format.timestamp(),
                format.json()
            ),
        }),
        // Combined logs
        new transports.DailyRotateFile({
            filename: path.join(logDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'info',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: format.combine(
                format.timestamp(),
                format.json()
            ),
        })
    );
}

// Create the logger instance
const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }), // Capture stack traces
        format.splat(),
        format.json()
    ),
    transports: loggerTransports,
    exitOnError: false, // Do not exit on handled exceptions
});

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
    logger.exceptions.handle(
        new transports.File({ filename: path.join(logDir, 'exceptions.log') })
    );
    logger.rejections.handle(
        new transports.File({ filename: path.join(logDir, 'rejections.log') })
    );
} else {
    logger.exceptions.handle(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
    logger.rejections.handle(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

export { logger };
