import { ServeStaticModuleAsyncOptions } from "./../node_modules/@nestjs/serve-static/dist/interfaces/serve-static-options.interface.d";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { LoggerModule } from "./logger/logger.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RequestLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { AdminAuthModule } from "./admin-auth/admin-auth.module";
import { TokenModule } from "./token/token.module";
import { MailModule } from "./mail/mail.module";
import { HrModule } from "./hr/hr.module";
import { BotModule } from "./bot/bot.module";
import { TelegrafModule } from "nestjs-telegraf";
import { BOT_NAME } from "./app.contstant";
import { HrAuthModule } from "./hr-auth/hr-auth.module";
import { CompanyModule } from "./company/company.module";
import { FileUploadModule } from "./file-upload/file-upload.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { CompanyHrModule } from './company-hr/company-hr.module';
import { EmployeModule } from './employe/employe.module';
import { EmployeeAuthModule } from './employee-auth/employee-auth.module';
import { WorkerHistoryModule } from './worker-history/worker-history.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "upload"),
    }),
    TelegrafModule.forRootAsync({
      botName: BOT_NAME,
      useFactory: () => ({
        token: process.env.BOT_TOKEN!,
        middlewares: [],
        include: [BotModule],
      }),
    }),
    LoggerModule,
    PrismaModule,
    AdminModule,
    AdminAuthModule,
    TokenModule,
    MailModule,
    HrModule,
    BotModule,
    HrAuthModule,
    CompanyModule,
    FileUploadModule,
    CompanyHrModule,
    EmployeModule,
    EmployeeAuthModule,
    WorkerHistoryModule,
    SupportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes("*");
  }
  
}
