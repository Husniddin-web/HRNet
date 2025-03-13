import { Module } from "@nestjs/common";
import { HrService } from "./hr.service";
import { HrController } from "./hr.controller";
import { PrismaModule } from "../prisma/prisma.module";
import {
  AdminAccessTokenStrategy,
  HrAccessTokenStrategy,
} from "../common/strategy";
import { BotModule } from "../bot/bot.module";

@Module({
  imports: [PrismaModule, BotModule],
  controllers: [HrController],
  providers: [HrService, AdminAccessTokenStrategy, HrAccessTokenStrategy],
  exports: [HrService],
})
export class HrModule {}
