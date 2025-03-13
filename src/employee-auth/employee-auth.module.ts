import { Module } from "@nestjs/common";
import { EmployeeAuthService } from "./employee-auth.service";
import { EmployeeAuthController } from "./employee-auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { MailModule } from "../mail/mail.module";
import { EmployeModule } from "../employe/employe.module";
import { TokenModule } from "../token/token.module";
import { RefreshTokenEmployeStrategy } from "../common/strategy/refresh-token-employe.strategy";

@Module({
  imports: [PrismaModule, MailModule, EmployeModule, TokenModule],
  controllers: [EmployeeAuthController],
  providers: [EmployeeAuthService, RefreshTokenEmployeStrategy],
})
export class EmployeeAuthModule {}
