import { Module } from "@nestjs/common";
import { SupportService } from "./support.service";
import { SupportController } from "./support.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminAccessTokenStrategy } from "../common/strategy";
import { BotModule } from "../bot/bot.module";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [PrismaModule, BotModule, AdminModule],
  controllers: [SupportController],
  providers: [SupportService, AdminAccessTokenStrategy],
})
export class SupportModule {}
