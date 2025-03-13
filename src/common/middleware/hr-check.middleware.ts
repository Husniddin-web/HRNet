import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class HrCheckMiddleware implements NestMiddleware {
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
    const decoded = this.jwtService.decode(token) as { id: number };

    if (!decoded || !decoded.id) {
      throw new ForbiddenException("Invalid token");
    }

    const hrId = decoded.id;
    const { company_id, employee_id } = req.body;

    const isHrAssociated = await this.prisma.companyHR.findFirst({
      where: {
        hr_id: hrId,
        company_id: company_id,
      },
    });

    if (!isHrAssociated) {
      throw new ForbiddenException(
        "You can only add worker history for your own company."
      );
    }

    next();
  }
}
