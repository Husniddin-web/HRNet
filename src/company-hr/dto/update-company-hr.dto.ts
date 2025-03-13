import { PartialType } from '@nestjs/swagger';
import { CreateCompanyHrDto } from './create-company-hr.dto';

export class UpdateCompanyHrDto extends PartialType(CreateCompanyHrDto) {}
