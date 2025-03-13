import { Injectable, Logger, LogLevel } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class AppLogger extends Logger {
  private logFilePath: string;
  private errorLogFilePath: string;

  constructor(context?: string) {
    super(context!);
    this.logFilePath = path.join(__dirname, "../../logs/app.log");
    this.errorLogFilePath = path.join(__dirname, "../../logs/error.log");
  }

  private writeToFile(level: string, message: string, trace?: string) {
    const logMessage = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message} ${
      trace ? `\nStack: ${trace}` : ""
    }\n`;

    if (level == "error") {
      fs.appendFile(this.errorLogFilePath, logMessage, (err) => {
        if (err) console.error("Error writing log file:", err);
      });
    } else {
      fs.appendFile(this.logFilePath, logMessage, (err) => {
        if (err) console.error("Error writing log file:", err);
      });
    }
  }

  log(message: string) {
    this.writeToFile("log", message);
  }

  error(message: string, trace?: string) {
    super.error(message, trace);
    this.writeToFile("error", message, trace);
  }

  warn(message: string) {
    this.writeToFile("warn", message);
  }

  debug(message: string) {
    this.writeToFile("debug", message);
  }

  verbose(message: string) {
    this.writeToFile("verbose", message);
  }
}
