import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Query,
} from "@nestjs/common";
import { WorkerHistoryService } from "./worker-history.service";
import { CreateWorkerHistoryDto } from "./dto/create-worker-history.dto";
import { UpdateWorkerHistoryDto } from "./dto/update-worker-history.dto";
import { AccessRequestDto } from "./dto/access-request.dto";
import { HrJwtAuth } from "../common/guards/hr-jwt-auth.guard";
import { GetCurrentUserId } from "../common/decorator/get-current-user-id.decorator";
import { EmployeJwtAuth } from "../common/guards/employe-jwt-auth.guard";
import { SelfGuard } from "../common/guards";
import { AdminJwtAuth } from "../common/guards/admin-jwt-auth.guard";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

@Controller("worker-history")
export class WorkerHistoryController {
  constructor(private readonly workerHistoryService: WorkerHistoryService) {}

  @UseGuards(HrJwtAuth)
  @ApiOperation({ summary: "Create employe history by hr " })
  @ApiBearerAuth("token")
  @Post()
  create(@Body() createWorkerHistoryDto: CreateWorkerHistoryDto) {
    return this.workerHistoryService.create(createWorkerHistoryDto);
  }

  @UseGuards(AdminJwtAuth)
  @ApiOperation({ summary: "Get all worker history by admin " })
  @ApiBearerAuth("token")
  @Get()
  findAll() {
    return this.workerHistoryService.findAll();
  }

  @Get("verify-access-request/:token")
  @ApiOperation({
    summary:
      "If employe dont tg acoount send emial and check and give response for hr",
  })
  async verifyAccessRequest(
    @Param("token") token: string,
    @Query("status") status: string
  ) {
    return this.workerHistoryService.responseRequest(token, status);
  }

  @UseGuards(EmployeJwtAuth)
  @ApiOperation({ summary: "Get own worker history" })
  @ApiBearerAuth("token")
  @Get("own")
  async getOwnWorkerHistory(@GetCurrentUserId() id: number) {
    return this.workerHistoryService.getOwnWorkerHistory(id);
  }

  @UseGuards(HrJwtAuth)
  @ApiBearerAuth("token")
  @ApiOperation({ summary: "Show employe history with token by hr " })
  @Post("show-employe/:link")
  async showEmployeHistory(
    @Param("link") link: string,
    @GetCurrentUserId() id: number
  ) {
    return this.workerHistoryService.getWorkerHistory(link, id);
  }

  @UseGuards(HrJwtAuth)
  @ApiBearerAuth("token")
  @ApiOperation({ summary: "Update worker history by hr " })
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateWorkerHistoryDto: UpdateWorkerHistoryDto
  ) {
    return this.workerHistoryService.update(+id, updateWorkerHistoryDto);
  }

  @UseGuards(EmployeJwtAuth)
  @ApiOperation({ summary: "Delete own worker history " })
  @ApiBearerAuth("token")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.workerHistoryService.remove(+id);
  }

  @UseGuards(HrJwtAuth)
  @ApiOperation({ summary: "Send request to see employee by hr" })
  @ApiBearerAuth("token")
  @Post("send-request")
  async sendRequestToEmploye(@Body() dto: AccessRequestDto) {
    return await this.workerHistoryService.sendShowWorkerHistory(dto);
  }
}
