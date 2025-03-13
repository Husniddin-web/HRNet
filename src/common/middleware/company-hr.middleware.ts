import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CompanyHrMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ForbiddenException("Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    if (token) {
      throw new BadRequestException("Token not found");
    }
    const decoded = this.jwtService.decode(token) as {
      id: number;
    };

    if (!decoded) {
      throw new ForbiddenException("Access Denied");
    }

    const workerHistoryId = Number(req.params.id);
    const workerHistory = await this.prisma.workerHistory.findUnique({
      where: { id: workerHistoryId },
      include: { company: true },
    });

    if (!workerHistory) {
      throw new NotFoundException("Worker history not found");
    }

    const isAsocited = await this.prisma.companyHR.findFirst({
      where: { hr_id: decoded.id, company_id: workerHistory.company!.id },
    });

    if (!isAsocited) {
      throw new ForbiddenException("You are not accociated this company");
    }

    next();
  }
}
