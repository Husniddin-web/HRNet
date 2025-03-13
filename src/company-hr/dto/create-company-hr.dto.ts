import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class CreateCompanyHrDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  hr_id: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  company_id: number;

  @ApiProperty({
    description: "Hr company document documentation file",
    type: "string",
    format: "binary",
  })
  hr_document: any;
}
