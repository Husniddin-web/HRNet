import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SelfCompanyGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const companyId = parseInt(req.params.id);

    if (!companyId) {
      throw new ForbiddenException("Invalid company ID.");
    }

    const company = await this.prisma.company.findFirst({
      where: { id: companyId, confirm_by_id: userId },
    });

    if (!company) {
      throw new ForbiddenException(
        "Access denied. You do not own this company."
      );
    }

    return true;
  }
}
