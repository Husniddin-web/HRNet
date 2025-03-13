import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from "class-validator";

export class CreateHrDto {
  @ApiProperty({
    example: "husniddinsalohiddinov2018@gmail.com",
    description: "HR email",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Husniddin Salohiddinov",
    description: "HR full_name",
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    example: "1234",
    description: "HR password",
  })
  @IsString()
  @MinLength(4)
  password: string;

  @ApiProperty({
    example: "+998881070125",
    description: "HR phone_number",
  })
  @IsPhoneNumber("UZ")
  phone_number: string;
}
