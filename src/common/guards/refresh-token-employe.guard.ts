import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RefreshTokenEmployeGuard extends AuthGuard("refresh-jwt-employe") {
  constructor() {
    super();
  }
}
