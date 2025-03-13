import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { Status } from "@prisma/client";
import { UpdatePasswordDto } from "../common/dto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    const admin = await this.prisma.admin.create({
      data: { ...createAdminDto, password: hashedPassword },
    });
    return admin;
  }

  findAll() {
    return this.prisma.admin.findMany({ include: { tg_user: true } });
  }

  async updateRefreshToken(id: number, hashed_refresh_token: string | null) {
    const updatedUser = await this.prisma.admin.update({
      where: { id },
      data: { refresh_token: hashed_refresh_token },
    });
    return updatedUser;
  }

  async findOne(id: number) {
    return this.prisma.admin.findUnique({
      where: { id },
      include: { tg_user: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.admin.findUnique({ where: { email } });
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const isExist = await this.findOne(id);

    if (!isExist) {
      throw new NotFoundException("Admin not found wit id");
    }

    return this.prisma.admin.update({ where: { id }, data: updateAdminDto });
  }

  async remove(id: number) {
    const isExist = await this.findOne(id);

    if (!isExist) {
      throw new NotFoundException("Admin not found wit id");
    }
    return await this.prisma.admin.delete({ where: { id } });
  }

  async updateStatus(userId: number, status: Status) {
    const admin = await this.findOne(userId);

    if (!admin) {
      throw new NotFoundException("Admin not found");
    }

    return this.prisma.admin.update({
      where: { id: userId },
      data: { status },
    });
  }

  async updatePassword(updatePassword: UpdatePasswordDto, userId: number) {
    const admin = await this.findOne(userId);
    if (!admin) {
      throw new NotFoundException();
    }

    const isMatch = await bcrypt.compare(
      updatePassword.oldPassword,
      admin.password
    );

    if (!isMatch) {
      throw new BadRequestException("Parol notogri");
    }
    const hashed_password = await bcrypt.hash(updatePassword.newPassword, 10);

    await this.prisma.admin.update({
      where: { id: userId },
      data: { password: hashed_password },
    });

    return {
      message: "Successfulyy updated password",
    };
  }

  async getAvailableAdmin() {
    let admin = await this.prisma.admin.findFirst({
      where: { is_busy: false },
      orderBy: { last_active: "asc" },
    });
    if (!admin) {
      admin = await this.prisma.admin.findFirst({
        orderBy: [{ request_count: "asc" }, { last_active: "asc" }],
      });
    }

    return admin;
  }

  async adminUpdateRequest(adminId: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { tg_user_id: adminId },
    });

    if (!admin) {
      console.log("❌ Admin not found.");
      return;
    }
    console.log(admin);

    const newRequestCount = Math.max(admin.request_count! - 1, 0);

    await this.prisma.admin.update({
      where: { tg_user_id: adminId },
      data: {
        request_count: newRequestCount,
        is_busy: newRequestCount > 0,
      },
    });
  }
}
