/***
 * 
 * A Winston-based logger for handling application logging needs.
 * logger.info() - For general informational messages and non-error events
 * logger.error() - For error conditions and exceptions
 * logger.warn() - For warning conditions that require attention
 *
 */

import winston from 'winston';
import { AppConfig } from '../config/config';

export const logger = winston.createLogger({
  level: AppConfig.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
}); 