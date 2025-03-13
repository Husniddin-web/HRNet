import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { PrismaModule } from "../prisma/prisma.module";
import { BotUpdate } from "./bot.update";
import { MailModule } from "../mail/mail.module";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [PrismaModule, MailModule, AdminModule],
  providers: [BotUpdate, BotService],
  exports: [BotService],
})
export class BotModule {}
