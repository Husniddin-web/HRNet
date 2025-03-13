import { Module } from "@nestjs/common";
import { CompanyService } from "./company.service";
import { CompanyController } from "./company.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { FileUploadModule } from "../file-upload/file-upload.module";
import { BotModule } from "../bot/bot.module";
import {
  AdminAccessTokenStrategy,
  HrAccessTokenStrategy,
} from "../common/strategy";

@Module({
  imports: [PrismaModule, FileUploadModule, BotModule],
  controllers: [CompanyController],
  providers: [CompanyService, AdminAccessTokenStrategy, HrAccessTokenStrategy],
})
export class CompanyModule {}
