import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { SupportService } from "./support.service";
import { CreateSupportDto } from "./dto/create-support.dto";
import { UpdateSupportDto } from "./dto/update-support.dto";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AdminJwtAuth } from "../common/guards/admin-jwt-auth.guard";

@Controller("support")
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @ApiOperation({ summary: "Send you support request" })
  @Post("send")
  create(@Body() createSupportDto: CreateSupportDto) {
    return this.supportService.create(createSupportDto);
  }

  @UseGuards(AdminJwtAuth)
  @ApiOperation({ summary: "Get all request by admin" })
  @ApiBearerAuth("token")
  @Get("all")
  findAll() {
    return this.supportService.findAll();
  }

  @UseGuards(AdminJwtAuth)
  @ApiOperation({ summary: "Get one by id request by admin" })
  @ApiBearerAuth("token")
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.supportService.findOne(+id);
  }

  @UseGuards(AdminJwtAuth)
  @ApiOperation({ summary: "Upda  request by admin" })
  @ApiBearerAuth("token")
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateSupportDto: UpdateSupportDto) {
    return this.supportService.update(+id, updateSupportDto);
  }

  @UseGuards(AdminJwtAuth)
  @ApiOperation({ summary: "Delete  request by admin" })
  @ApiBearerAuth("token")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.supportService.remove(+id);
  }
}
