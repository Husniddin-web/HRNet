import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCompanyHrDto } from "./dto/create-company-hr.dto";
import { UpdateCompanyHrDto } from "./dto/update-company-hr.dto";
import { PrismaModule } from "../prisma/prisma.module";
import { BotService } from "../bot/bot.service";
import { PrismaService } from "../prisma/prisma.service";
import { FileUploadService } from "../file-upload/file-upload.service";

@Injectable()
export class CompanyHrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly botService: BotService,
    private readonly fileUploadService: FileUploadService
  ) {}

  async create(createCompanyHrDto: CreateCompanyHrDto, file: any) {
    const isExist = await this.prisma.companyHR.findFirst({
      where: {
        hr_id: createCompanyHrDto.hr_id,
        company_id: createCompanyHrDto.company_id,
      },
    });

    if (isExist) {
      throw new BadRequestException("this hr already exist in this company");
    }
    const hr = await this.prisma.hR.findFirst({
      where: { id: createCompanyHrDto.hr_id, status: "ACTIVE" },
    });
    if (!hr) {
      throw new BadRequestException("Hr  not found");
    }

    const company = await this.prisma.company.findFirst({
      where: { id: createCompanyHrDto.company_id, status: "ACTIVE" },
    });
    if (!company) {
      throw new NotFoundException("Company is not found");
    }
    const fileName = await this.fileUploadService.saveFile(file);

    const companyHr = await this.prisma.companyHR.create({
      data: { ...createCompanyHrDto, hr_document: fileName },
    });
    await this.botService.sendNewCompanyHR(companyHr.id);

    return companyHr;
  }

  findAll() {
    return this.prisma.companyHR.findMany();
  }

  findOne(id: number) {
    return this.prisma.companyHR.findUnique({ where: { id } });
  }

  async update(id: number, updateCompanyHrDto: UpdateCompanyHrDto) {
    const company_hr = await this.findOne(id);
    if (!company_hr) {
      throw new NotFoundException();
    }
    return await this.prisma.companyHR.update({
      where: { id },
      data: updateCompanyHrDto,
    });
  }

  async remove(id: number) {
    const company_hr = await this.findOne(id);
    if (!company_hr) {
      throw new NotFoundException();
    }
    await this.prisma.companyHR.delete({ where: { id } });
    return { message: "Successfully deleted" };
  }

  async getCompanyHr(user_id: number) {
    return this.prisma.company.findMany({
      where: { created_by_id: user_id },
      include: { CompanyHR: true },
    });
  }
}
