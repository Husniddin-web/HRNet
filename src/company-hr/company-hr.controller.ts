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
import { CompanyHrService } from "./company-hr.service";
import { CreateCompanyHrDto } from "./dto/create-company-hr.dto";
import { UpdateCompanyHrDto } from "./dto/update-company-hr.dto";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { CompanyHrJwtAuthGuard } from "../common/guards/company-hr.guard";
import { AdminJwtAuth } from "../common/guards/admin-jwt-auth.guard";
import { HrAccessTokenStrategy } from "../common/strategy";
import { HrJwtAuth } from "../common/guards/hr-jwt-auth.guard";
import { SelfCompanyGuard } from "../common/guards/self-company.guard";
import { GetCurrentUser } from "../common/decorator/get-current-user.decorator";
import { GetCurrentUserId } from "../common/decorator/get-current-user-id.decorator";

@ApiTags("Company HR") // Adds a tag in Swagger
@Controller("company-hr")
export class CompanyHrController {
  constructor(private readonly companyHrService: CompanyHrService) {}

  @ApiOperation({ summary: "Create a new Company HR" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 201, description: "Company HR successfully created." })
  @ApiResponse({ status: 400, description: "Bad request." })
  @Post()
  @UseInterceptors(FileInterceptor("hr_document"))
  create(
    @UploadedFile() file: any,
    @Body() createCompanyHrDto: CreateCompanyHrDto
  ) {
    return this.companyHrService.create(createCompanyHrDto, file);
  }

  @UseGuards(AdminJwtAuth)
  @ApiBearerAuth("token")
  @ApiOperation({ summary: "Get all Company HRs" })
  @ApiResponse({ status: 200, description: "List of Company HRs." })
  @Get()
  findAll() {
    return this.companyHrService.findAll();
  }

  @UseGuards(HrJwtAuth)
  @ApiBearerAuth("token")
  @Get("allhr/:id")
  async getCompanyHr(@GetCurrentUserId() user_id: number) {
    return this.companyHrService.getCompanyHr(user_id);
  }

  @UseGuards(HrJwtAuth)
  @ApiBearerAuth("token")
  @ApiOperation({ summary: "Update a Company HR by ID" })
  @ApiResponse({ status: 200, description: "Company HR successfully updated." })
  @ApiResponse({ status: 400, description: "Bad request." })
  @ApiResponse({ status: 404, description: "Company HR not found." })
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCompanyHrDto: UpdateCompanyHrDto
  ) {
    return this.companyHrService.update(+id, updateCompanyHrDto);
  }

  @UseGuards(HrJwtAuth)
  @ApiBearerAuth("token")
  @ApiOperation({ summary: "Delete a Company HR by ID" })
  @ApiResponse({ status: 200, description: "Company HR successfully deleted." })
  @ApiResponse({ status: 404, description: "Company HR not found." })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.companyHrService.remove(+id);
  }
}
