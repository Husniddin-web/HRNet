import { ApiProperty } from "@nestjs/swagger";
import { Status } from "@prisma/client";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateStatus {
  @ApiProperty({ example: "ACTIVE" })
  status: Status;

  @ApiProperty({ example: "Very nice" })
  @IsString()
  @IsOptional()
  reason: string;
}
