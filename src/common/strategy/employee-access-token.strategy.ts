import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../types";

@Injectable()
export class EmployeAccessTokenStrategy extends PassportStrategy(
  Strategy,
  "employe-jwt"
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.EMPLOYE_ACCESS_TOKEN_KEY!,
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload: JwtPayload): JwtPayload {
    return payload;
  }
}
