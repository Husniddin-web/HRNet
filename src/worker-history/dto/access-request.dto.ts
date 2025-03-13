import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class AccessRequestDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  hr_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  employe_id: number;
}
