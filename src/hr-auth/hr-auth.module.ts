import { Module } from "@nestjs/common";
import { HrAuthService } from "./hr-auth.service";
import { HrAuthController } from "./hr-auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { HrModule } from "../hr/hr.module";
import { TokenModule } from "../token/token.module";
import { RefreshTokenHrGuard } from "../common/guards/refresh-token-hr.guard";
import { RefreshTokenHrStrategy } from "../common/strategy/refresh-token-hr.strategy";

@Module({
  imports: [PrismaModule, HrModule, TokenModule],
  controllers: [HrAuthController],
  providers: [HrAuthService, RefreshTokenHrStrategy],
  exports: [HrAuthService],
})
export class HrAuthModule {}
