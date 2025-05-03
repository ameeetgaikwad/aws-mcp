import { format as dateFnsFormat, parseISO } from "date-fns";

import winston, { format, createLogger, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;
import path from "path";
import { AppConfig } from "../config/config";
export function formatTimestamp(timestamp: string): string {
  const date = parseISO(timestamp);
  return dateFnsFormat(date, "yyyy-MM-dd HH:mm:ss");
}
const customFormat = printf(({ level, message, timestamp }) => {
  return `[ ${formatTimestamp(
    timestamp as string,
  )} ] -  ${level} -  ${message}`;
});

const logger = createLogger({
  level: AppConfig.logLevel || "info",
  format: combine(colorize(), timestamp(), customFormat),

  transports: [new transports.Console()],
});

export { logger };
