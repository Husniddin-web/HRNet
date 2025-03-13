import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from "class-validator";

export class CreateEmployeDto {
  @ApiProperty({
    example: "husniddinsalohiddinov1974@gmail.com",
    description: "user email",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Husniddin Salohiddinov" })
  @IsString()
  full_name: string;

  @ApiProperty({ example: "+998881070125" })
  @IsPhoneNumber("UZ")
  phone_number: string;

  @ApiProperty({ example: "1234" })
  @IsString()
  @IsOptional()
  password: string;

  @IsBoolean()
  @IsOptional()
  is_temproray: boolean;

  @IsString()
  @IsOptional()
  activation_link: string;
}
