import { ApiProperty } from "@nestjs/swagger";
import { ROLE } from "@prisma/client";
import { IsEmail, IsEnum } from "class-validator";

export class CreateSupportDto {
  @ApiProperty({ example: "HR", description: "Write who are you" })
  @IsEnum(ROLE)
  role: ROLE;

  @ApiProperty({ example: "husniddinsalohiddinov1974@gmail.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "dasada" })
  problem: string;
}
