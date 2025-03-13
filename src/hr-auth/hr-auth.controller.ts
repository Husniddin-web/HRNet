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
  UseGuards,
  HttpStatus,
} from "@nestjs/common";
import { HrAuthService } from "./hr-auth.service";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CreateHrDto } from "../hr/dto";
import { LoginHrDto } from "./dto/login-hr.dto";

import { Response } from "express";
import { GetCurrentUserId } from "../common/decorator/get-current-user-id.decorator";
import { CookieGetter } from "../common/decorator/cookie-getter.decorator";
import { RefreshTokenHrGuard } from "../common/guards/refresh-token-hr.guard";

@ApiTags("HR_AUTH")
@Controller("hr-auth")
export class HrAuthController {
  constructor(private readonly hrAuthService: HrAuthService) {}

  @ApiOperation({ summary: "Register new hr" })
  @ApiResponse({
    description: "Succefully register new hr wait admin response",
  })
  @Post("sign-up")
  async signUp(@Body() signUpDto: CreateHrDto) {
    return await this.hrAuthService.signUpHr(signUpDto);
  }

  @ApiOperation({ summary: "HR Login" })
  @ApiResponse({ description: "Authenticate HR and return access token." })
  @Post("login")
  async login(
    @Body() loginDto: LoginHrDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return await this.hrAuthService.loginHr(loginDto, res);
  }

  @UseGuards(RefreshTokenHrGuard)
  @ApiBearerAuth("token")
  @ApiOperation({
    summary: "Refresh Hr Token",
  })
  @ApiResponse({
    description: "Successfully refresh and access token",
    status: 200,
  })
  @Post("refresh")
  async refreshHrTokens(
    @GetCurrentUserId() userId: number,
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.hrAuthService.refreshHrToken(userId, refreshToken, res);
  }

  @UseGuards(RefreshTokenHrGuard)
  @ApiBearerAuth("token")
  @ApiOperation({
    summary: "Sign Out HR",
    description: "Logs out the hr and clears the refresh token",
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
    return this.hrAuthService.signOut(id, res);
  }
}
