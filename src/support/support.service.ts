import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateSupportDto } from "./dto/create-support.dto";
import { UpdateSupportDto } from "./dto/update-support.dto";
import { PrismaService } from "../prisma/prisma.service";
import { BotService } from "../bot/bot.service";
import { AdminService } from "../admin/admin.service";

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly botService: BotService,
    private readonly adminService: AdminService
  ) {}
  async create(createSupportDto: CreateSupportDto) {
    const admin = await this.adminService.getAvailableAdmin();
    if (!admin || !admin.tg_user_id) {
      throw new BadRequestException("PLease try again later");
    }

    const support = await this.prisma.supportReqeust.create({
      data: {
        role: createSupportDto.role,
        email: createSupportDto.email,
        problem: createSupportDto.problem,
        admin_id: admin.id,
      },
    });

    await this.botService.sendSupportRequestToAdmin(support.id);

    return { message: "Message send to amdin " };
  }

  findAll() {
    return this.prisma.supportReqeust.findMany({ include: { admin: true } });
  }

  async findOne(id: number) {
    const support = await this.prisma.supportReqeust.findUnique({
      where: { id },
    });
    if (!support) {
      throw new NotFoundException();
    }
    return support;
  }

  async update(id: number, updateSupportDto: UpdateSupportDto) {
    await this.findOne(id);
    return this.prisma.supportReqeust.update({
      where: { id },
      data: updateSupportDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.supportReqeust.delete({ where: { id } });
    return { message: "Deleted" };
  }
}
