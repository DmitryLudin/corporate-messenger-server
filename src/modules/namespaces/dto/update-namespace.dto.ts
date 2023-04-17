import { PartialType } from '@nestjs/mapped-types';
import { CreateNamespaceDto } from './create-namespace.dto';

export class UpdateNamespaceDto extends PartialType(CreateNamespaceDto) {}
