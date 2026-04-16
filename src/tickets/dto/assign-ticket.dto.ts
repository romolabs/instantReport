import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignTicketDto {
  @ApiProperty()
  @IsUUID()
  assignedToId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
