import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser, JwtAuthGuard, type AuthenticatedUser } from '../auth';
import { type AttachmentUploadFile, createAttachmentUploadOptions } from './attachment-upload';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketsService } from './tickets.service';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll(@CurrentUser() actor: AuthenticatedUser) {
    return this.ticketsService.findAll(actor);
  }

  @Post()
  create(@Body() payload: CreateTicketDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.ticketsService.create(payload, actor);
  }

  @Get(':ticketId')
  findOne(@Param('ticketId') ticketId: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.ticketsService.findOne(ticketId, actor);
  }

  @Patch(':ticketId/assign')
  assign(
    @Param('ticketId') ticketId: string,
    @Body() payload: AssignTicketDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.ticketsService.assign(ticketId, payload, actor);
  }

  @Patch(':ticketId/status')
  updateStatus(
    @Param('ticketId') ticketId: string,
    @Body() payload: UpdateTicketStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.ticketsService.updateStatus(ticketId, payload, actor);
  }

  @Post(':ticketId/comments')
  addComment(
    @Param('ticketId') ticketId: string,
    @Body() payload: CreateTicketCommentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.ticketsService.addComment(ticketId, payload, actor);
  }

  @Post(':ticketId/attachments')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file', createAttachmentUploadOptions()))
  uploadAttachment(
    @Param('ticketId') ticketId: string,
    @UploadedFile() file: AttachmentUploadFile | undefined,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.ticketsService.uploadAttachment(ticketId, file, actor);
  }
}
