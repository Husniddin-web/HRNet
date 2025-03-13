import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateWorkerHistoryDto } from "./dto/create-worker-history.dto";
import { UpdateWorkerHistoryDto } from "./dto/update-worker-history.dto";
import { PrismaService } from "../prisma/prisma.service";
import { AccessRequestDto } from "./dto/access-request.dto";
import { BotService } from "../bot/bot.service";
import { decode, encode } from "../common/helper/crypto";
import { MailService } from "../mail/mail.service";
const { v4: uuidv4 } = require("uuid");

@Injectable()
export class WorkerHistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly botService: BotService
  ) {}
  async create(createWorkerHistoryDto: CreateWorkerHistoryDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: createWorkerHistoryDto.employee_id },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    const company = await this.prisma.company.findUnique({
      where: { id: createWorkerHistoryDto.company_id },
    });

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    return this.prisma.workerHistory.create({
      data: {
        employee: {
          connect: { id: createWorkerHistoryDto.employee_id },
        },
        company: {
          connect: { id: createWorkerHistoryDto.company_id },
        },
        employment_type: createWorkerHistoryDto.employment_type,
        position: createWorkerHistoryDto.position,
        working_mode: createWorkerHistoryDto.working_mode,
      },
    });
  }

  findAll() {
    return this.prisma.workerHistory.findMany({
      include: { company: true, employee: true },
    });
  }

  findOne(id: number) {
    return this.prisma.workerHistory.findUnique({ where: { id } });
  }

  async update(id: number, updateWorkerHistoryDto: UpdateWorkerHistoryDto) {
    const workerHistory = await this.findOne(id);

    if (!workerHistory) {
      throw new NotFoundException("Worker history not found");
    }

    const updateData: any = {};

    if (updateWorkerHistoryDto.employment_type !== undefined) {
      updateData.employment_type = updateWorkerHistoryDto.employment_type;
    }
    if (updateWorkerHistoryDto.position !== undefined) {
      updateData.position = updateWorkerHistoryDto.position;
    }
    if (updateWorkerHistoryDto.left_at !== undefined) {
      updateData.left_at = updateWorkerHistoryDto.left_at;
    }
    if (updateWorkerHistoryDto.performance_score !== undefined) {
      updateData.performance_score = updateWorkerHistoryDto.performance_score;
    }
    if (updateWorkerHistoryDto.working_mode !== undefined) {
      updateData.working_mode = updateWorkerHistoryDto.working_mode;
    }
    if (updateWorkerHistoryDto.status !== undefined) {
      updateData.status = updateWorkerHistoryDto.status;
    }
    if (updateWorkerHistoryDto.positive_feedback !== undefined) {
      updateData.positive_feedback = updateWorkerHistoryDto.positive_feedback;
    }
    if (updateWorkerHistoryDto.negative_feedback !== undefined) {
      updateData.negative_feedback = updateWorkerHistoryDto.negative_feedback;
    }

    if (updateWorkerHistoryDto.employee_id !== undefined) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: updateWorkerHistoryDto.employee_id },
      });

      if (!employee) {
        throw new NotFoundException("Employee not found");
      }

      updateData.employee = {
        connect: { id: updateWorkerHistoryDto.employee_id },
      };
    }

    if (updateWorkerHistoryDto.company_id !== undefined) {
      const company = await this.prisma.company.findUnique({
        where: { id: updateWorkerHistoryDto.company_id },
      });

      if (!company) {
        throw new NotFoundException("Company not found");
      }

      updateData.company = {
        connect: { id: updateWorkerHistoryDto.company_id },
      };
    }

    return this.prisma.workerHistory.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const isExist = await this.findOne(id);
    if (!isExist) {
      throw new NotFoundException("Worker history not found");
    }
    return this.prisma.workerHistory.delete({ where: { id } });
  }

  async sendShowWorkerHistory(accessRequestDto: AccessRequestDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: accessRequestDto.employe_id },
    });

    if (!employee) {
      throw new BadRequestException("Employe not found ");
    }

    const request = await this.prisma.accessRequest.create({
      data: accessRequestDto,
    });
    console.log(request);

    if (employee.tg_user_id) {
      await this.botService.sendAccessRequestToEmploye(
        employee.id,
        accessRequestDto.hr_id,
        request.id
      );

      return { message: "Request send to employe  to employee telegram bot " };
    } else {
      const hr = await this.prisma.hR.findUnique({
        where: { id: accessRequestDto.hr_id },
      });
      const link = uuidv4();
      await this.prisma.accessRequest.update({
        where: { id: request.id },
        data: { link },
      });
      await this.mailService.sendMailRequestAccess(
        hr!.full_name,
        employee.email,
        link
      );
    }
  }

  async getWorkerHistory(token: string, hr_id: number) {
    const decodedData = await decode(token);
    const details = JSON.parse(decodedData);

    if (hr_id != details.hr_id) {
      throw new ForbiddenException();
    }

    console.log(details);

    const expirationTime = new Date(details.expiration_time);
    const currentTime = new Date();

    if (currentTime > expirationTime) {
      throw new UnauthorizedException(
        "⏳ This link has expired. Please request access again."
      );
    }

    const workerHistory = await this.prisma.workerHistory.findFirst({
      where: { employee_id: Number(details.employe_id) },
    });

    console.log(workerHistory);

    return workerHistory;
  }

  async getOwnWorkerHistory(user_id: number) {
    return await this.prisma.workerHistory.findMany({
      where: { employee_id: user_id },
    });
  }

  async responseRequest(link: string, status: string) {
    const request = await this.prisma.accessRequest.findFirst({
      where: { link },
      include: { hr: true },
    });
    if (!request) {
      throw new NotFoundException("request not found");
    }

    if (status == "accept") {
      const expiration_time = new Date();
      expiration_time.setHours(expiration_time.getHours() + 24);

      const details = {
        expiration_time: expiration_time.toISOString(),
        hr_id: request.hr_id,
        employe_id: request.employe_id,
      };

      const token = await encode(JSON.stringify(details));

      await this.botService.sednHrResponse({
        status: "accept",
        token,
        tg_chat: request.hr.tg_user_id,
      });

      await this.prisma.accessRequest.update({
        where: { id: Number(request.id) },
        data: { status: "ACTIVE" },
      });
    } else {
      await this.botService.sednHrResponse({
        status: "rejected",
        tg_chat: request.hr.tg_user_id,
      });

      await this.prisma.accessRequest.update({
        where: { id: Number(request.id) },
        data: { status: "BLOCKED" },
      });
    }
    await this.prisma.accessRequest.update({
      where: { id: request.id },
      data: { link: null },
    });
    return { message: "Habar yuborildi" };
  }
}
