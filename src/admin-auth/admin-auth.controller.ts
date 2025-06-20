import { GetCurrentUserId } from "./../common/decorator/get-current-user-id.decorator";
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { AdminAuthService } from "./admin-auth.service";
import { CreateAdminDto, SignInDto } from "../admin/dto";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Response } from "express";
import { ResponseFields } from "../common/types";
import { CookieGetter } from "../common/decorator/cookie-getter.decorator";
import { GetCurrentUser } from "../common/decorator/get-current-user.decorator";
import { RefreshTokenAdminGuard, RolesGuard } from "../common/guards";
import { Roles } from "../common/decorator/role-auth.decorator";
import { ROLE } from "@prisma/client";
import { AdminJwtAuth } from "../common/guards/admin-jwt-auth.guard";

@Controller("admin-auth")
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Roles(ROLE.SUPERADMIN)
  @UseGuards(AdminJwtAuth, RolesGuard)
  @ApiOperation({
    summary: "Register Admin ",
    description: "Register Admin by SuperAdmin",
  })
  @ApiResponse({
    description: "Successfulyy created check admin email send login",
    status: 201,
  })
  @ApiBearerAuth("token")
  @Post("register")
  async registerAdmin(@Body() registerAdminDto: CreateAdminDto) {
    return this.adminAuthService.adminRegister(registerAdminDto);
  }

  @ApiOperation({
    summary: "Login In Admin ",
    description: "Login Admin by SuperAdmin",
  })
  @ApiResponse({
    description: "Successfulyy login",
    status: 200,
  })
  @HttpCode(HttpStatus.OK)
  @Post("sign-in")
  async signinAdmin(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseFields> {
    return this.adminAuthService.signInAdmin(signInDto, res);
  }

  @UseGuards(RefreshTokenAdminGuard)
  @ApiOperation({
    summary: "Sign Out Admin",
    description: "Logs out the admin and clears the refresh token",
  })
  @ApiResponse({
    description: "Successfully signed out",
    status: 200,
  })
  @HttpCode(HttpStatus.OK)
  @Post("sign-out")
  async signOut(
    @GetCurrentUserId() id: number,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.adminAuthService.signOut(id, res);
  }

  @UseGuards(RefreshTokenAdminGuard)
  @ApiOperation({
    summary: "Refresh Admin Token",
  })
  @ApiResponse({
    description: "Successfully refresh and access token",
    status: 200,
  })
  @Post("refresh")
  async refreshAdminTokens(
    @GetCurrentUserId() userId: number,
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.adminAuthService.refreshTokenAdmin(userId, refreshToken, res);
  }
}
