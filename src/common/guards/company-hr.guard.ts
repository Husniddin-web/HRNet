import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class CompanyHrJwtAuthGuard extends AuthGuard(["hr-jwt", "admin-jwt"]) {
  constructor() {
    super();
  }
}
