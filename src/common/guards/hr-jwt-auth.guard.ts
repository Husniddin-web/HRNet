import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Passport } from "passport";

@Injectable()
export class HrJwtAuth extends AuthGuard("hr-jwt") {
  constructor() {
    super();
  }
}
