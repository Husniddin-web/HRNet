import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { CreateEmployeDto } from "../employe/dto/create-employe.dto";
import { EmployeService } from "../employe/employe.service";
import { EmployeloginDto } from "./dto/login.dto";
const { v4: uuidv4 } = require("uuid");
import * as bcrypt from "bcrypt";
import { TokenService } from "../token/token.service";
import { ResponseFields } from "../common/types";
import { Response } from "express";
import { AccessRequestDto } from "../worker-history/dto/access-request.dto";

@Injectable()
export class EmployeeAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly employeService: EmployeService,
    private readonly tokenService: TokenService
  ) {}

  async signUp(signUp: CreateEmployeDto) {
    const isExist = await this.prisma.employee.findUnique({
      where: { email: signUp.email },
    });

    const isPhoneUsed = await this.prisma.employee.findFirst({
      where: { phone_number: signUp.phone_number },
    });
    if (isExist || isPhoneUsed) {
      throw new BadRequestException("Employee already exist");
    }

    const link = uuidv4();

    const user = await this.employeService.create({
      ...signUp,
      activation_link: link,
    });
    await this.mailService.sendMailEmployee(user);

    const response = {
      message: "Succesfully registered send activation link to email",
    };

    return response;
  }

  async verifyEmploye(link: string) {
    const user = await this.prisma.employee.findFirst({
      where: { activation_link: link, is_temproray: false },
    });

    if (!user) {
      throw new BadRequestException("Employee not found");
    }

    await this.prisma.employee.update({
      where: { id: user.id },
      data: { status: "ACTIVE", activation_link: null },
    });

    const response = { message: "Employee faollashtilidi" };

    return response;
  }

  async loginEmployee(
    loginDto: EmployeloginDto,
    res: Response
  ): Promise<ResponseFields> {
    const user = await this.employeService.findByemail(loginDto.email);
    if (!user) {
      throw new BadRequestException("Email yoki password notogri");
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password!);

    if (!isMatch) {
      throw new BadRequestException("Email yoki password notogri");
    }

    if (!user.tg_user_id) {
      throw new BadRequestException("Iltimos telegram bot orqali reg qiling");
    }

    if (user.status != "ACTIVE") {
      throw new ForbiddenException("Acoount faol emas");
    }

    const tokens = await this.tokenService.generateTokens(user, "EMPLOYE");

    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);

    const isSaved = await this.employeService.updateRefreshToken(
      user.id,
      hashed_refresh_token
    );

    if (!isSaved) {
      throw new InternalServerErrorException("Tokenni saqlashda xatolik");
    }

    res.cookie("refresh_token", tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    const response = {
      id: user.id,
      access_token: tokens.access_token,
    };

    return response;
  }

  async logOut(userId: number, res: Response) {
    const isUpdated = await this.employeService.updateRefreshToken(
      userId,
      null
    );

    if (!isUpdated) {
      throw new InternalServerErrorException("Error signing out");
    }

    res.clearCookie("refresh_token", { httpOnly: true, secure: true });

    return { message: "Successfully signed out" };
  }

  async refreshEmployeToken(
    hrId: number,
    refreshToken: string,
    res: Response
  ): Promise<ResponseFields> {
    const user = await this.employeService.findOne(hrId);

    if (!user || !user.refresh_token) {
      throw new BadRequestException("Employe not found");
    }

    const tokenMatch = await bcrypt.compare(refreshToken, user.refresh_token);

    if (!tokenMatch) {
      throw new ForbiddenException();
    }

    const tokens = await this.tokenService.generateTokens(user, "EMPLOYE");

    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);

    await this.employeService.updateRefreshToken(user.id, hashed_refresh_token);
    res.cookie("refresh_token", tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    const response = {
      id: user.id,
      access_token: tokens.access_token,
    };

    return response;
  }
}
