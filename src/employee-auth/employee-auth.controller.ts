import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { EmployeeAuthService } from "./employee-auth.service";
import { CreateEmployeDto } from "../employe/dto/create-employe.dto";
import { EmployeloginDto } from "./dto/login.dto";
import { Response } from "express";
import { RefreshTokenEmployeStrategy } from "../common/strategy/refresh-token-employe.strategy";
import { RefreshTokenEmployeGuard } from "../common/guards/refresh-token-employe.guard";
import { GetCurrentUserId } from "../common/decorator/get-current-user-id.decorator";
import { CookieGetter } from "../common/decorator/cookie-getter.decorator";

@Controller("employee-auth")
export class EmployeeAuthController {
  constructor(private readonly employeeAuthService: EmployeeAuthService) {}

  @Post("sign-up")
  create(@Body() createEmployeeAuthDto: CreateEmployeDto) {
    return this.employeeAuthService.signUp(createEmployeeAuthDto);
  }

  @Patch("verify/:link")
  async verifyEmployee(@Param("link") link: string) {
    return this.employeeAuthService.verifyEmploye(link);
  }

  @Post("login")
  login(
    @Body() loginDto: EmployeloginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.employeeAuthService.loginEmployee(loginDto, res);
  }

  @UseGuards(RefreshTokenEmployeGuard)
  @HttpCode(HttpStatus.OK)
  @Post("sign-out")
  async signOut(
    @GetCurrentUserId() id: number,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.employeeAuthService.logOut(id, res);
  }

  @UseGuards(RefreshTokenEmployeGuard)
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  async refreshHrTokens(
    @GetCurrentUserId() userId: number,
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.employeeAuthService.refreshEmployeToken(
      userId,
      refreshToken,
      res
    );
  }
}
