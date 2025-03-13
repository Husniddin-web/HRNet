import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString } from "class-validator";

export class EmployeloginDto {
  @ApiProperty({ example: "husniddinsalohiddinov1974@gmail.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "1234" })
  @IsString()
  password: string;
}
