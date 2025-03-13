import { MailService } from "./../mail/mail.service";
import { BotService } from "./../bot/bot.service";
import {
  BadRequestException,
  Get,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateEmployeDto } from "./dto/create-employe.dto";
import { UpdateEmployeDto } from "./dto/update-employe.dto";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { TemproraryEmployee } from "./dto/temproray-employe.dto";
import { TempEmployeDto } from "./dto/create-password.dto";
import { use } from "passport";
import { ApiQuery } from "@nestjs/swagger";
const { v4: uuidv4 } = require("uuid");

@Injectable()
export class EmployeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}
  async create(createEmployeDto: CreateEmployeDto) {
    console.log(createEmployeDto.activation_link);
    const hashed_password = await bcrypt.hash(createEmployeDto.password, 10);
    const user = await this.prisma.employee.create({
      data: { ...createEmployeDto, password: hashed_password },
    });
    return user;
  }

  findAll() {
    return this.prisma.employee.findMany({ include: { WorkerHistory: true } });
  }

  async findOne(id: number) {
    return await this.prisma.employee.findUnique({
      where: { id },
      include: { WorkerHistory: true },
    });
  }

  async createTemproraryUser(createTempEmployee: TemproraryEmployee) {
    const link = uuidv4();

    const isExit = await this.prisma.employee.findUnique({
      where: { email: createTempEmployee.email },
    });
    const isPhoneUsed = await this.prisma.employee.findFirst({
      where: { phone_number: createTempEmployee.phone_number },
    });

    if (isExit || isPhoneUsed) {
      throw new BadRequestException("Employer already exist");
    }

    const user = await this.prisma.employee.create({
      data: { ...createTempEmployee, activation_link: link },
    });

    await this.mailService.sendMailEmployee(user);

    return user;
  }

  async createPassword(tempEmployeDto: TempEmployeDto, link: string) {
    const user = await this.prisma.employee.findFirst({
      where: {
        email: tempEmployeDto.email,
        activation_link: link,
        is_temproray: true,
      },
    });

    if (!user) {
      throw new BadRequestException("Employee not found");
    }
    const hashed_password = await bcrypt.hash(tempEmployeDto.new_password, 10);

    await this.prisma.employee.update({
      where: { email: tempEmployeDto.email },
      data: {
        password: hashed_password,
        activation_link: null,
        is_temproray: false,
        status: "ACTIVE",
      },
    });

    const response = { message: "Paroll saqlandi tizimga kirish mumkin" };

    return response;
  }

  async updateRefreshToken(id: number, hashed_refresh_token: string | null) {
    const updatedUser = await this.prisma.employee.update({
      where: { id },
      data: { refresh_token: hashed_refresh_token },
    });
    return updatedUser;
  }

  async findByemail(email: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { email },
    });

    if (!employee) {
      throw new NotFoundException("Employe not found");
    }
    return employee;
  }

  async update(id: number, updateEmployeDto: UpdateEmployeDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }

    return await this.prisma.employee.update({
      where: { id: user.id },
      data: updateEmployeDto,
    });
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }

    return await this.prisma.employee.delete({ where: { id } });
  }

  async hrServiceByAnyParam(params: { [key: string]: string }) {
    const whereCondition = Object.keys(params).reduce((acc, key) => {
      acc[key] = { contains: params[key], mode: "insensitive" };
      return acc;
    }, {});

    return this.prisma.employee.findMany({
      where: whereCondition,
      select: {
        full_name: true,
        email: true,
        id: true,
        tg_user: true,
        phone_number: true,
      },
    });
  }
}
