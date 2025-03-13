import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class WorkerHistoryMiddleware implements NestMiddleware {
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

    if (!token) {
      throw new BadRequestException("Token not found");
    }

    const id = Number(req.params.id);
    const decoded = this.jwtService.decode(token) as {
      id: number;
    };

    const workerHisotry = await this.prisma.workerHistory.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!workerHisotry) {
      throw new NotFoundException("Worker history not found");
    }

    if (decoded.id != workerHisotry!.employee!.id) {
      throw new ForbiddenException("Action is forbidden for you");
    }

    next();
  }
}
