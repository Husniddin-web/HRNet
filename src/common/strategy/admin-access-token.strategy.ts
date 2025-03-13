import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../types";

@Injectable()
export class AdminAccessTokenStrategy extends PassportStrategy(
  Strategy,
  "admin-jwt"
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ADMIN_ACCESS_TOKEN_KEY!,
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload: JwtPayload): JwtPayload {
    return payload;
  }
}
