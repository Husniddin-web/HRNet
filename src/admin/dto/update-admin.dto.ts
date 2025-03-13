import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from "class-validator";

export class UpdateAdminDto {
  @ApiProperty({ example: "Ali Kamolov" })
  @IsOptional()
  @IsString()
  full_name: string;

  @ApiProperty({ example: "+998998761514" })
  @IsOptional()
  @IsPhoneNumber("UZ")
  phone_number: string;

  @ApiProperty({ example: "ali@gmail.com" })
  @IsOptional()
  @IsEmail()
  email: string;
}
