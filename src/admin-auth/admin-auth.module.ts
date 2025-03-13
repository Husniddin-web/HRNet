import { Module } from "@nestjs/common";
import { AdminAuthService } from "./admin-auth.service";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminModule } from "../admin/admin.module";
import { JwtModule } from "@nestjs/jwt";
import { TokenModule } from "../token/token.module";
import { MailModule } from "../mail/mail.module";
import { RefreshTokenAdminGuard } from "../common/guards";
import {
  AdminAccessTokenStrategy,
  RefreshTokenAdminStrategy,
} from "../common/strategy";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    JwtModule.register({ global: true }),
    AdminModule,
    TokenModule,
    MailModule,
    PrismaModule
  ],
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    RefreshTokenAdminStrategy,
    AdminAccessTokenStrategy,
  ],
})
export class AdminAuthModule {}
