import { Injectable, NestMiddleware, ForbiddenException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CompanyOwnerMiddleware implements NestMiddleware {
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
    const decoded = this.jwtService.decode(token) as {
      id: number;
      role: string;
    };

    if (!decoded || decoded.role !== "HR") {
      throw new ForbiddenException("Access Denied");
    }

    const companyHrId = Number(req.params.id);
    const companyHrRecord = await this.prisma.companyHR.findUnique({
      where: { id: companyHrId },
      include: { company: true },
    });

    if (!companyHrRecord) {
      throw new ForbiddenException("CompanyHR record not found");
    }

    const isCompanyOwner = companyHrRecord.company.created_by_id == decoded.id;
    if (!isCompanyOwner) {
      throw new ForbiddenException(
        "Only the company owner can update/delete this record"
      );
    }

    next();
  }
}
