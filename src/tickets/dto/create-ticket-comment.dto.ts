import { CommentType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTicketCommentDto {
  @ApiProperty()
  @IsString()
  body!: string;

  @ApiPropertyOptional({ enum: CommentType, default: CommentType.PUBLIC })
  @IsOptional()
  @IsEnum(CommentType)
  type?: CommentType;
}

