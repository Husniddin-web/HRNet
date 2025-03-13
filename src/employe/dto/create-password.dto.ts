import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class TempEmployeDto {
  @ApiProperty({ example: "1234" })
  @IsString()
  new_password: string;

  @ApiProperty({ example: "husniddinsalohiddinov1974@gmail.com" })
  @IsEmail()
  email: string;
}
