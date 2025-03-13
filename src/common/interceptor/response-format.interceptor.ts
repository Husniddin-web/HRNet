import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import { AppLogger } from "../../logger/logger.service";

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== "http") {
      return next.handle();
    }
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    return next.handle().pipe(
      map((data) => {
        const formattedResponse = {
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
          success: true,
          data: data || {},
        };

        const logEntry = {
          level: "info",
          timestamp: new Date().toISOString(),
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
          responseData: data,
        };

        this.logger.log(JSON.stringify(logEntry));

        return formattedResponse;
      })
    );
  }
}
