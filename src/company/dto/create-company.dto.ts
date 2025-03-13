import {
  MulterField,
  MulterOptions,
} from "./../../../node_modules/@nestjs/platform-express/multer/interfaces/multer-options.interface.d";
import { File } from "./../../../node_modules/@telegraf/types/manage.d";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Express } from "express"; // Import for file handling

export class CreateCompanyDto {
  @ApiProperty({ example: "Epam", description: "Company name" })
  @IsString()
  name: string;

  @ApiProperty({
    example: "Tashkent, Uzbekistan",
    description: "Company address",
  })
  @IsString()
  address: string;

  @ApiProperty({ description: "Director's full name" })
  @IsString()
  @IsNotEmpty()
  director_full_name: string;

  @ApiProperty({ description: "Director's phone number" })
  @IsString()
  @IsNotEmpty()
  director_phone: string;

  @ApiProperty({ description: "Director's email" })
  @IsString()
  @IsNotEmpty()
  director_email: string;

  @ApiProperty({ example: 1, description: "Created by HR ID" })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  created_by_id: number;

  @ApiProperty({
    description: "Company documentation file",
    type: "string",
    format: "binary",
  })
  company_documentation: any;
}
