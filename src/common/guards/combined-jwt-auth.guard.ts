import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class CombinedJwtAuthGuard extends AuthGuard([
  "employe-jwt",
  "admin-jwt",
]) {
  constructor() {
    super();
  }
}
