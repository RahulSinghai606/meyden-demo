import winston from 'winston';
import { config } from '../config/environment';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(logColors);

// Create format for console logs
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Create format for file logs
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports
const transports: winston.transport[] = [];

// Console transport for development
// Console transport (always enabled for containerized environments like Railway)
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
    level: config.logLevel,
  })
);

// File transport for error logs
transports.push(
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
    maxsize: parseSize(config.logMaxSize),
    maxFiles: config.logMaxFiles,
  })
);

// File transport for all logs
transports.push(
  new winston.transports.File({
    filename: config.logFile,
    level: config.logLevel,
    format: fileFormat,
    maxsize: parseSize(config.logMaxSize),
    maxFiles: config.logMaxFiles,
  })
);

// Create logger
export const logger = winston.createLogger({
  levels: logLevels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Helper function to parse file size strings like "10m", "100k"
function parseSize(sizeStr: string): number {
  const units = { k: 1024, m: 1024 * 1024, g: 1024 * 1024 * 1024 };
  const match = sizeStr.toLowerCase().match(/^(\d+)([kmg]?)$/);
  if (!match) return 10 * 1024 * 1024; // default 10MB
  
  const value = parseInt(match[1], 10);
  const unit = match[2] || '';
  
  return units[unit as keyof typeof units] || value;
}

// Create stream for Morgan HTTP logger
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export logger methods for convenience
export const logInfo = (message: string, meta?: any) => logger.info(message, meta);
export const logError = (message: string, error?: any) => logger.error(message, error);
export const logWarn = (message: string, meta?: any) => logger.warn(message, meta);
export const logDebug = (message: string, meta?: any) => logger.debug(message, meta);
export const logHttp = (message: string, meta?: any) => logger.http(message, meta);

export default logger;