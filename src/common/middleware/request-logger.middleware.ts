import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AppLogger } from "../../logger/logger.service";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers, body } = req;
    const userAgent = headers["user-agent"] || "unknown";
    const startTime = Date.now();

    res.on("finish", () => {
      const statusCode = res.statusCode;
      const responseTime = Date.now() - startTime;

      const logEntry = {
        level: "info",
        timestamp: new Date().toISOString(),
        method,
        url: originalUrl,
        statusCode,
        ip,
        userAgent,
        responseTime: `${responseTime}ms`,
        requestBody: body,
      };

      this.logger.log(JSON.stringify(logEntry));
    });

    next();
  }
}
