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
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { Roles } from "../common/decorator/role-auth.decorator";
import { ROLE } from "@prisma/client";
import { AdminJwtAuth } from "../common/guards/admin-jwt-auth.guard";
import { RolesGuard, SelfGuard } from "../common/guards";
import { UpdatePasswordDto } from "../common/dto";
import { GetCurrentUser } from "../common/decorator/get-current-user.decorator";
import { GetCurrentUserId } from "../common/decorator/get-current-user-id.decorator";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles(ROLE.SUPERADMIN)
  @UseGuards(AdminJwtAuth, RolesGuard)
  @ApiOperation({
    summary: "Get All Admin",
    description: "Get list of all admins",
  })
  @Get()
  @ApiBearerAuth("token")
  findAll() {
    return this.adminService.findAll();
  }

  @UseGuards(AdminJwtAuth)
  @ApiOperation({
    summary: "Get admin by id",
    description: "Get admin by id",
  })
  @ApiNotFoundResponse({ description: "admin not found" })
  @ApiBearerAuth("token")
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.adminService.findOne(+id);
  }

  @UseGuards(AdminJwtAuth, SelfGuard)
  @ApiOperation({ summary: "Update admin", description: "Update admin" })
  @ApiResponse({ description: "Successfully updated" })
  @ApiNotFoundResponse({ description: "admin not found" })
  @ApiBearerAuth("token")
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Roles(ROLE.SUPERADMIN)
  @UseGuards(AdminJwtAuth, RolesGuard)
  @ApiOperation({ summary: "Delete admin", description: "Deleted admin " })
  @ApiResponse({ description: "Successfully updated" })
  @ApiNotFoundResponse({ description: "admin not found" })
  @ApiBearerAuth("token")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminService.remove(+id);
  }

  
  @UseGuards(AdminJwtAuth)
  @ApiOperation({ summary: "Update admin password", description: "Update admin password" })
  @ApiResponse({ description: "Successfully updated" })
  @ApiBearerAuth("token")
  @Post("update-password")
  async updateAdminPassword(
    @Body() updatePassword: UpdatePasswordDto,
    @GetCurrentUserId() id: number
  ) {
    return this.adminService.updatePassword(updatePassword, id);
  }
}
