import { PartialType } from '@nestjs/swagger';
import { CreateEmployeDto } from './create-employe.dto';

export class UpdateEmployeDto extends PartialType(CreateEmployeDto) {}
