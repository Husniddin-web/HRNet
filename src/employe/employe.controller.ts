import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { EmployeService } from "./employe.service";
import { CreateEmployeDto } from "./dto/create-employe.dto";
import { UpdateEmployeDto } from "./dto/update-employe.dto";
import { TemproraryEmployee } from "./dto/temproray-employe.dto";
import { HrJwtAuth } from "../common/guards/hr-jwt-auth.guard";
import { TempEmployeDto } from "./dto/create-password.dto";
import { CombinedJwtAuthGuard } from "../common/guards/combined-jwt-auth.guard";
import { ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { EmployeJwtAuth } from "../common/guards/employe-jwt-auth.guard";
import { SelfGuard } from "../common/guards";
import { AdminJwtAuth } from "../common/guards/admin-jwt-auth.guard";
import { CompanyHrJwtAuthGuard } from "../common/guards/company-hr.guard";

@Controller("employe")
export class EmployeController {
  constructor(private readonly employeService: EmployeService) {}

  @UseGuards(HrJwtAuth)
  @ApiBearerAuth("token")
  @Post("temp")
  createTempEmployeByHr(@Body() createTempUser: TemproraryEmployee) {
    return this.employeService.createTemproraryUser(createTempUser);
  }

  @UseGuards(AdminJwtAuth)
  @ApiBearerAuth("token")
  @Get()
  findAll() {
    return this.employeService.findAll();
  }

  @UseGuards(CompanyHrJwtAuthGuard)
  @ApiOperation({ summary: "get employer by any params" })
  @ApiBearerAuth("token")
  @ApiQuery({ name: "full_name", required: false, type: String })
  @ApiQuery({ name: "email", required: false, type: String })
  @Get("search")
  async findAnyParam(@Query() query: { [key: string]: string }) {
    return this.employeService.hrServiceByAnyParam(query);
  }

  @UseGuards(CombinedJwtAuthGuard)
  @ApiBearerAuth("token")
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.employeService.findOne(+id);
  }

  @UseGuards(EmployeJwtAuth, SelfGuard)
  @ApiBearerAuth("token")
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateEmployeDto: UpdateEmployeDto) {
    return this.employeService.update(+id, updateEmployeDto);
  }

  @Patch("save/:link")
  createPassword(
    @Param("link") link: string,
    @Body() updateEmployeDto: TempEmployeDto
  ) {
    return this.employeService.createPassword(updateEmployeDto, link);
  }

  @UseGuards(AdminJwtAuth)
  @ApiOperation({ summary: "Delete by admin Employee" })
  @ApiBearerAuth("token")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.employeService.remove(+id);
  }
}
