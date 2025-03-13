import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsOptional } from "class-validator";

export class UpdatePasswordDto {
  @ApiProperty({ example: "1234" })
  @IsString()
  @MinLength(4, { message: "Old password must be at least 6 characters long" })
  oldPassword: string;

  @ApiProperty({ example: "1234" })
  @IsString()
  @MinLength(4, { message: "New password must be at least 6 characters long" })
  newPassword: string;
}
