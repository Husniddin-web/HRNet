import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { Response, Request } from "express";
import { AppLogger } from "../../logger/logger.service";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception?.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception?.response?.message ||
      exception?.message ||
      "Internal server error";

    this.logger.error(
      `🚨 Exception: ${request.method} ${request.url} - ${status} - ${message}`,
      exception.stack
    );

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
