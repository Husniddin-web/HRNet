import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../types";

@Injectable()
export class HrAccessTokenStrategy extends PassportStrategy(
  Strategy,
  "hr-jwt"
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.HR_ACCESS_TOKEN_KEY!,
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload: JwtPayload): JwtPayload {
    return payload;
  }
}
