import { PartialType } from '@nestjs/swagger';
import { CreateHrDto } from './create-hr.dto';

export class UpdateHrDto extends PartialType(CreateHrDto) {}
