import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/config/allexceptions.filter";
import { AppLogger } from "./logger/logger.service";
import { ResponseFormatInterceptor } from "./common/interceptor/response-format.interceptor";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { config } from "process";

async function bootstrap() {
  try {
    const PORT = process.env.PORT || 3030;
    const app = await NestFactory.create(AppModule);

    const logger = app.get(AppLogger);

    app.useGlobalFilters(new AllExceptionsFilter(logger));

    app.useGlobalInterceptors(new ResponseFormatInterceptor(logger));

    const options = new DocumentBuilder()
      .setTitle("HRNET")
      .setDescription("API documentation for HrNet platform")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          in: "header",
        },
        "token"
      )
      .build();
    app.setGlobalPrefix("api");

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("api/docs", app, document);
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      })
    );
    (BigInt.prototype as any).toJSON = function () {
      return this.toString();
    };

    await app.listen(PORT, () => {
      console.log(`server running http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Setup ", error);
    process.exit(1);
  }
}
bootstrap();
