import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Admin } from "@prisma/client";
import { TokenService } from "../token/token.service";
import { CreateAdminDto, SignInDto } from "../admin/dto";
import * as bcrypt from "bcrypt";
import { AdminService } from "../admin/admin.service";
import { MailService } from "../mail/mail.service";
import { Response } from "express";
import { ResponseFields } from "../common/types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService
  ) {}

  async adminRegister(createAdminDto: CreateAdminDto) {
    const isExist = await this.adminService.findByEmail(createAdminDto.email);

    const isPhoneUsed = await this.prisma.admin.findFirst({
      where: { phone_number: createAdminDto.phone_number },
    });

    if (isExist || isPhoneUsed) {
      throw new BadRequestException("Admin already exist");
    }

    await this.adminService.create(createAdminDto);

    await this.mailService.sendMail({
      full_name: createAdminDto.full_name,

      email: createAdminDto.email,

      password: createAdminDto.password,
    });

    return { message: "Successfully created admin" };
  }

  async signInAdmin(
    siginDto: SignInDto,
    res: Response
  ): Promise<ResponseFields> {
    const admin = await this.adminService.findByEmail(siginDto.email);

    if (!admin) {
      throw new BadRequestException("Email yoki parol notogri");
    }

    const isMatch = await bcrypt.compare(siginDto.password, admin.password);

    if (!isMatch) {
      throw new BadRequestException("Email yoki parol notogri");
    }

    const tokens = await this.tokenService.generateTokens(admin, "ADMIN");

    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);

    const isSaved = await this.adminService.updateRefreshToken(
      admin.id,
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
      id: admin.id,
      access_token: tokens.access_token,
    };

    await this.adminService.updateStatus(admin.id, "ACTIVE");

    return response;
  }

  async signOut(userId: number, res: Response) {
    const isUpdated = await this.adminService.updateRefreshToken(userId, null);

    if (!isUpdated) {
      throw new InternalServerErrorException("Error signing out");
    }

    res.clearCookie("refresh_token", { httpOnly: true, secure: true });

    console.log("addd commit");
    return { message: "Successfully signed out" };
    
  }


  async refreshTokenAdmin(
    adminId: number,
    refreshToken: string,
    res: Response
  ): Promise<ResponseFields> {
    const admin = await this.adminService.findOne(adminId);

    if (!admin || !admin.refresh_token) {
      throw new BadRequestException("admin not found");
    }

    const tokenMatch = await bcrypt.compare(refreshToken, admin.refresh_token);

    if (!tokenMatch) {
      throw new ForbiddenException();
    }

    const tokens = await this.tokenService.generateTokens(admin, "ADMIN");

    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);

    await this.adminService.updateRefreshToken(admin.id, hashed_refresh_token);
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
}
