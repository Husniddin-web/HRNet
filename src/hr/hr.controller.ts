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
import { HrService } from "./hr.service";
import { CreateHrDto } from "./dto/create-hr.dto";
import { UpdateHrDto } from "./dto/update-hr.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../common/decorator/role-auth.decorator";
import { ROLE } from "@prisma/client";
import { AdminJwtAuth } from "../common/guards/admin-jwt-auth.guard";
import { RolesGuard, SelfGuard } from "../common/guards";
import { HrJwtAuth } from "../common/guards/hr-jwt-auth.guard";
import { CombinedJwtAuthGuard } from "../common/guards/combined-jwt-auth.guard";

@ApiTags("HR")
@ApiBearerAuth("token")
@Controller("hr")
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Roles(ROLE.ADMIN, ROLE.SUPERADMIN)
  @UseGuards(AdminJwtAuth, RolesGuard)
  @Get()
  @ApiOperation({ summary: "Get all HRs", description: "Fetch all HR users" })
  @ApiResponse({ status: 200, description: "List of HR users" })
  findAll() {
    return this.hrService.findAll();
  }

  @UseGuards(CombinedJwtAuthGuard)
  @ApiQuery({ name: "full_name", required: false, type: String })
  @Get("search")
  async findAnyParam(@Query() query: { [key: string]: string }) {
    return this.hrService.hrServiceByAnyParam(query);
  }

  @UseGuards(HrJwtAuth)
  @Get(":id")
  @ApiOperation({
    summary: "Get HR by ID",
    description: "Fetch a specific HR user by ID",
  })
  @ApiResponse({ status: 200, description: "HR found" })
  @ApiResponse({ status: 404, description: "HR not found" })
  findOne(@Param("id") id: string) {
    return this.hrService.findOne(+id);
  }

  @UseGuards(HrJwtAuth, SelfGuard)
  @Patch(":id")
  @ApiOperation({
    summary: "Update HR",
    description: "Update details of an HR user",
  })
  @ApiResponse({ status: 200, description: "HR successfully updated" })
  @ApiResponse({ status: 404, description: "HR not found" })
  update(@Param("id") id: string, @Body() updateHrDto: UpdateHrDto) {
    return this.hrService.update(+id, updateHrDto);
  }

  @Roles(ROLE.ADMIN, ROLE.SUPERADMIN)
  @UseGuards(AdminJwtAuth, RolesGuard)
  @Delete(":id")
  @ApiOperation({
    summary: "Delete HR",
    description: "Delete an HR user by ID",
  })
  @ApiResponse({ status: 200, description: "HR successfully deleted" })
  @ApiResponse({ status: 404, description: "HR not found" })
  remove(@Param("id") id: string) {
    return this.hrService.remove(+id);
  }
}
