import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {
  @ApiProperty({example:"husniddinsalohiddinov1974@gmail.com"})
  email: string;
  @ApiProperty({example:"1234"})
  password: string;
}
