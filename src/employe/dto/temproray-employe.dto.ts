import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsPhoneNumber, IsString } from "class-validator";

export class TemproraryEmployee {
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

  @ApiProperty({ example: true })
  @IsBoolean()
  is_temproray: boolean;
}
