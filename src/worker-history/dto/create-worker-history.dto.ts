import { ApiProperty } from "@nestjs/swagger";
import { Status } from "@prisma/client";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateWorkerHistoryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  employee_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  company_id: number;

  @ApiProperty({ example: "Full time" })
  @IsString()
  employment_type: string;

  @ApiProperty({ example: "Devops" })
  @IsString()
  position: string;

  @IsOptional()
  left_at: Date;

  @IsOptional()
  performance_score: number;

  @ApiProperty({ example: "online" })
  @IsString()
  working_mode: string;

  @IsOptional()
  status: Status;

  @IsOptional()
  positive_feedback: string;

  @IsOptional()
  negative_feedback: string;
}
