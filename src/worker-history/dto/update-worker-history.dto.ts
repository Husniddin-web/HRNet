import { PartialType } from '@nestjs/swagger';
import { CreateWorkerHistoryDto } from './create-worker-history.dto';

export class UpdateWorkerHistoryDto extends PartialType(CreateWorkerHistoryDto) {}
