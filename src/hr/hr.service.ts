import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateHrDto } from "./dto/create-hr.dto";
import { UpdateHrDto } from "./dto/update-hr.dto";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { Status } from "@prisma/client";
import { BotService } from "../bot/bot.service";

@Injectable()
export class HrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly botService: BotService
  ) {}

  async create(createHrDto: CreateHrDto) {
    const hashed_password = await bcrypt.hash(createHrDto.password, 10);

    const hr = await this.prisma.hR.create({
      data: { ...createHrDto, password: hashed_password },
    });

    await this.botService.sendAdminHrApproval(hr.id);
    return hr;
  }

  findAll() {
    return this.prisma.hR.findMany({
      include: { Company: true, CompanyHR: true },
    });
  }

  async findOne(id: number) {
    const hr = await this.prisma.hR.findFirst({ where: { id } });

    if (!hr) {
      throw new BadRequestException("Hr not found");
    }
    return hr;
  }

  async update(id: number, updateHrDto: UpdateHrDto) {
    await this.findOne(id);
    return this.prisma.hR.update({ where: { id }, data: updateHrDto });
  }

  async remove(id: number) {
    const hr = await this.findOne(id);

    if (!hr) {
      throw new NotFoundException("Hr Not Found");
    }

    await this.prisma.hR.delete({ where: { id } });
    return { message: "Successfully deleted" };
  }

  async updateRefreshToken(id: number, hashed_refresh_token: string | null) {
    const updatedUser = await this.prisma.hR.update({
      where: { id },
      data: { refresh_token: hashed_refresh_token },
    });
    return updatedUser;
  }

  async updateHrStatus(id: number, status: Status) {
    const hr = await this.findOne(id);

    if (!hr) {
      throw new NotFoundException("HR not found");
    }

    const isUpdated = await this.prisma.hR.update({
      where: { id },
      data: { status },
    });

    return isUpdated;
  }
  async hrServiceByAnyParam(params: { [key: string]: string }) {
    const whereCondition = Object.keys(params).reduce((acc, key) => {
      acc[key] = { contains: params[key], mode: "insensitive" };
      return acc;
    }, {});

    return this.prisma.hR.findMany({ where: whereCondition });
  }
}
