import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Passport } from "passport";

@Injectable()
export class EmployeJwtAuth extends AuthGuard("employe-jwt") {
  constructor() {
    super();
  }
}
