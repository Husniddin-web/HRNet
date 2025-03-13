import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Passport } from "passport";

@Injectable()
export class AdminJwtAuth extends AuthGuard("admin-jwt") {
  constructor() {
    super();
  }
}
