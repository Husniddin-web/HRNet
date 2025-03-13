import { ApiProperty } from "@nestjs/swagger";
import { ROLE } from "@prisma/client";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from "class-validator";

export class CreateAdminDto {
  @ApiProperty({ example: "Ali Karmiov", description: "Admin full_name" })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: "+998994562312", description: "Admin phone_number" })
  @IsPhoneNumber("UZ")
  phone_number: string;

  @ApiProperty({ example: "ali@gmail.com", description: "Admin email" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "1234", description: "Admin password" })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @ApiProperty({
    example: ROLE.ADMIN,
    description: "Admin role is optional give super admin",
  })
  @IsOptional()
  @IsEnum(ROLE)
  role: ROLE;
}
