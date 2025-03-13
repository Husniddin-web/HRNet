import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from "@nestjs/common";
import { CompanyService } from "./company.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { AdminJwtAuth } from "../common/guards/admin-jwt-auth.guard";
import { RolesGuard } from "../common/guards";
import { Roles } from "../common/decorator/role-auth.decorator";
import { ROLE } from "@prisma/client";
import { HrJwtAuth } from "../common/guards/hr-jwt-auth.guard";
import { UpdateStatus } from "./dto/update-status.dto";

@ApiTags("Company")
@ApiBearerAuth("token")
@Controller("company")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ApiOperation({ summary: "Create a new company hr" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 201, description: "Company successfully created." })
  @ApiResponse({ status: 400, description: "Bad request." })
  @Post()
  @UseInterceptors(FileInterceptor("company_documentation"))
  create(
    @UploadedFile() file: any,
    @Body() createCompanyDto: CreateCompanyDto
  ) {
    return this.companyService.create(createCompanyDto, file);
  }

  @ApiOperation({ summary: "Get all companies" })
  @ApiResponse({ status: 200, description: "List of all companies." })
  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @ApiOperation({ summary: "Get a single company by ID" })
  @ApiResponse({ status: 200, description: "Company found." })
  @ApiResponse({ status: 404, description: "Company not found." })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.companyService.findOne(+id);
  }

  @UseGuards(HrJwtAuth)
  @ApiOperation({ summary: "Update a company by ID" })
  @ApiResponse({ status: 200, description: "Company updated successfully." })
  @ApiResponse({ status: 404, description: "Company not found." })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(+id, updateCompanyDto);
  }

  @ApiOperation({ summary: "Delete a company by ID" })
  @ApiResponse({ status: 200, description: "Company deleted successfully." })
  @ApiResponse({ status: 404, description: "Company not found." })
  @UseGuards(AdminJwtAuth)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.companyService.remove(+id);
  }

  @UseGuards(AdminJwtAuth)
  @Patch("update/status/:id")
  updateCompanyStatus(
    @Param("id") id: string,
    @Body() updateStatus: UpdateStatus
  ) {
    return this.companyService.updateCompanyStatus(updateStatus, +id);
  }

  @Get("search/name/:name")
  searchByName(@Param("name") name: string) {
    return this.companyService.searchCompanyByName(name);
  }
}
