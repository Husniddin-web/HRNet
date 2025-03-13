import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { PrismaService } from "../prisma/prisma.service";
import { FileUploadService } from "../file-upload/file-upload.service";
import { BotService } from "../bot/bot.service";
import { Status } from "@prisma/client";
import { UpdateStatus } from "./dto/update-status.dto";

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly botService: BotService,
    private readonly fileService: FileUploadService
  ) {}
  async create(createCompanyDto: CreateCompanyDto, file: any) {
    const isExistName = await this.prisma.company.findUnique({
      where: { name: createCompanyDto.name.toLowerCase() },
    });
    if (isExistName) {
      throw new BadRequestException("Company Already Exist");
    }

    const hr = await this.prisma.hR.findFirst({
      where: { id: createCompanyDto.created_by_id },
    });

    if (hr?.status != "ACTIVE") {
      throw new BadRequestException("HR is not active");
    }

    const fileName = await this.fileService.saveFile(file);

    const company = await this.prisma.company.create({
      data: {
        ...createCompanyDto,
        company_documentation: fileName,
        name: createCompanyDto.name.toLowerCase(),
      },
    });

    await this.botService.sendAdminCompanyApproval(company.id);

    return {
      message:
        "Succesfully created company wait admin respone send to email verifaction",
    };
  }

  findAll() {
    return this.prisma.company.findMany();
  }

  findOne(id: number) {
    return this.prisma.company.findUnique({ where: { id } });
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(id);
    if (!company) {
      throw new NotFoundException();
    }
    const hr = await this.prisma.hR.findUnique({
      where: { id: updateCompanyDto.created_by_id },
    });

    if (!hr) {
      throw new BadRequestException();
    }

    return await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: number) {
    const company = await this.findOne(id);
    if (!company) {
      throw new NotFoundException();
    }
    await this.prisma.company.delete({ where: { id } });
    return { message: "Company deleted succesfully" };
  }

  async updateCompanyStatus(dto: UpdateStatus, id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException("Company not found");
    }
    return this.prisma.company.update({
      where: { id },
      data: { status: dto.status, rejection_reason: dto?.reason },
    });
  }

  async searchCompanyByName(name: string) {
    const company = await this.prisma.company.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
    });

    return company;
  }
}
