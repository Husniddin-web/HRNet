import { Module } from "@nestjs/common";
import { EmployeService } from "./employe.service";
import { EmployeController } from "./employe.controller";
import { PrismaModule } from "../prisma/prisma.module";
import {
  AdminAccessTokenStrategy,
  HrAccessTokenStrategy,
} from "../common/strategy";
import { BotModule } from "../bot/bot.module";
import { MailModule } from "../mail/mail.module";
import { EmployeAccessTokenStrategy } from "../common/strategy/employee-access-token.strategy";

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [EmployeController],
  providers: [
    EmployeService,
    HrAccessTokenStrategy,
    AdminAccessTokenStrategy,
    EmployeAccessTokenStrategy,
  ],
  exports: [EmployeService],
})
export class EmployeModule {}
