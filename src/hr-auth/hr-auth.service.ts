import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { HrService } from "../hr/hr.service";
import { CreateHrDto } from "../hr/dto";
import { LoginHrDto } from "./dto/login-hr.dto";
import * as bcrypt from "bcrypt";
import { TokenService } from "../token/token.service";
import { LoginAssociateResponse, ResponseFields } from "../common/types";
import { Response } from "express";

@Injectable()
export class HrAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hrService: HrService,
    private readonly tokenService: TokenService
  ) {}

  async signUpHr(signUpHrDto: CreateHrDto) {
    const isExit = await this.prisma.hR.findUnique({
      where: { email: signUpHrDto.email },
    });

    const isPhoneUsed = await this.prisma.hR.findFirst({
      where: { phone_number: signUpHrDto.phone_number },
    });

    if (isExit || isPhoneUsed) {
      throw new BadRequestException("Hr already exist");
    }
    const hr = await this.hrService.create(signUpHrDto);
    if (!hr) {
      throw new BadRequestException();
    }

    return {
      message:
        "Succesfully register new hr wait admin respone send email verification letter",
    };
  }

  async loginHr(
    loginHrDto: LoginHrDto,
    res: Response
  ): Promise<ResponseFields | LoginAssociateResponse> {
    const hr = await this.prisma.hR.findFirst({
      where: { email: loginHrDto.email, phone_number: loginHrDto.phone_number },
    });
    if (!hr) {
      throw new BadRequestException(
        "Email yoki Telefon Raqam yoki parol Notogri "
      );
    }
    console.log(hr);

    const isMatch = await bcrypt.compare(loginHrDto.password, hr.password);

    if (!isMatch) {
      throw new BadRequestException(
        "Email yoki Telefon Raqam yoki parol Notogri "
      );
    }
    if (hr.status != "ACTIVE") {
      throw new UnauthorizedException();
    }
    if (!hr.tg_user_id) {
      throw new BadRequestException(
        "Ilitmos telegram bot orqali ham royhatdan o'ting"
      );
    }

    if (!hr.is_associate) {
      return {
        id: hr.id,
        message:
          "Iltimos kompanyaga malumotlarni kiriting yoki company yarating",
      };
    }

    const tokens = await this.tokenService.generateTokens(hr, "HR");

    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);

    const isSaved = await this.hrService.updateRefreshToken(
      hr.id,
      hashed_refresh_token
    );

    if (!isSaved) {
      throw new InternalServerErrorException("Tokenni saqlashda xatolik");
    }

    res.cookie("refresh_token", tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return { id: hr.id, access_token: tokens.access_token };
  }

  async refreshHrToken(
    hrId: number,
    refreshToken: string,
    res: Response
  ): Promise<ResponseFields> {
    const admin = await this.hrService.findOne(hrId);

    if (!admin || !admin.refresh_token) {
      throw new BadRequestException("admin not found");
    }

    const tokenMatch = await bcrypt.compare(refreshToken, admin.refresh_token);

    if (!tokenMatch) {
      throw new ForbiddenException();
    }

    const tokens = await this.tokenService.generateTokens(admin, "HR");

    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);

    await this.hrService.updateRefreshToken(admin.id, hashed_refresh_token);
    res.cookie("refresh_token", tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    const response = {
      id: admin.id,
      access_token: tokens.access_token,
    };

    return response;
  }

  async signOut(userId: number, res: Response) {
    const isUpdated = await this.hrService.updateRefreshToken(userId, null);

    if (!isUpdated) {
      throw new InternalServerErrorException("Error signing out");
    }

    res.clearCookie("refresh_token", { httpOnly: true, secure: true });

    return { message: "Successfully signed out" };
  }
}
