import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { CompanyHrService } from "./company-hr.service";
import { CompanyHrController } from "./company-hr.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { FileUploadModule } from "../file-upload/file-upload.module";
import { BotModule } from "../bot/bot.module";
import {
  AdminAccessTokenStrategy,
  HrAccessTokenStrategy,
} from "../common/strategy";
import { CompanyOwnerMiddleware } from "../common/middleware/company-owner.middleware";

@Module({
  imports: [PrismaModule, FileUploadModule, BotModule],
  controllers: [CompanyHrController],
  providers: [
    CompanyHrService,
    AdminAccessTokenStrategy,
    HrAccessTokenStrategy,
  ],
})
export class CompanyHrModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CompanyOwnerMiddleware).forRoutes(
      { path: "company-hr/:id", method: RequestMethod.PATCH },
      { path: "company-hr/:id", method: RequestMethod.DELETE }
    );
  }
}
