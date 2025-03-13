import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RefreshTokenHrGuard extends AuthGuard("refresh-jwt-hr") {
  constructor() {
    super();
  }
}
