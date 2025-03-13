import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RefreshTokenAdminGuard extends AuthGuard("refresh-jwt-admin") {
  constructor() {
    super();
  }
}
