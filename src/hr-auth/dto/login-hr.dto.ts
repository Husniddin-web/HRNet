import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class LoginHrDto {
  @ApiProperty({
    example: "husniddinsalohiddinov2018@gmail.com",
    description: "Hr email",
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: "+998881070125", description: "Hr phone  number" })
  @IsPhoneNumber("UZ")
  phone_number: string;

  @ApiProperty({ example: "1234", description: "Hr password" })
  @IsString()
  @MinLength(4)
  password: string;
}
