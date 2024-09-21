import { PartialType } from '@nestjs/swagger';
import { CreateToolsIntegrationDto } from './create-tools-integration.dto';

export class UpdateToolsIntegrationDto extends PartialType(CreateToolsIntegrationDto) {}
