import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import { Tokens } from "../common/types";

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}
  async generateTokens(user: any, userType: string): Promise<Tokens> {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role ?? userType,
    };

    const accessTokenKey = process.env[`${userType}_ACCESS_TOKEN_KEY`];
    const accessTokenTime = process.env[`${userType}_ACCESS_TOKEN_TIME`];
    const refreshTokenKey = process.env[`${userType}_REFRESH_TOKEN_KEY`];
    const refreshTokenTime = process.env[`${userType}_REFRESH_TOKEN_TIME`];

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessTokenKey,
        expiresIn: accessTokenTime,
      }),

      this.jwtService.signAsync(payload, {
        secret: refreshTokenKey,
        expiresIn: refreshTokenTime,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
