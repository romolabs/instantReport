import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommentType, Prisma, TicketPriority, TicketStatus, UserRole } from '@prisma/client';
import { isUUID } from 'class-validator';
import { randomBytes } from 'crypto';

import { type AuthenticatedUser } from '../auth';
import { PrismaService } from '../prisma/prisma.service';
import {
  ATTACHMENT_MAX_BYTES,
  type AttachmentUploadFile,
  buildAttachmentFileUrl,
  isSupportedAttachmentFile,
  removeStoredAttachmentFile,
} from './attachment-upload';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

const userSummarySelect = {
  id: true,
  fullName: true,
  email: true,
  department: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect;

const ticketDetailInclude = {
  requester: {
    select: userSummarySelect,
  },
  assignedTo: {
    select: userSummarySelect,
  },
  category: true,
  comments: {
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      author: {
        select: userSummarySelect,
      },
    },
  },
  statusHistory: {
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      changedBy: {
        select: userSummarySelect,
      },
    },
  },
  attachments: {
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      uploadedBy: {
        select: userSummarySelect,
      },
    },
  },
} as const satisfies Prisma.TicketInclude;

const ticketListSelect = {
  id: true,
  ticketNumber: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  rootCause: true,
  resolutionSummary: true,
  reopenReason: true,
  location: true,
  assetTag: true,
  firstResponseAt: true,
  resolvedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  requester: {
    select: userSummarySelect,
  },
  assignedTo: {
    select: userSummarySelect,
  },
  category: true,
  _count: {
    select: {
      comments: true,
      attachments: true,
      statusHistory: true,
    },
  },
} as const satisfies Prisma.TicketSelect;

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(actor: AuthenticatedUser) {
    const tickets = await this.prisma.ticket.findMany({
      where: this.ticketAccessWhere(actor),
      orderBy: {
        createdAt: 'desc',
      },
      select: ticketListSelect,
    });

    return tickets.map((ticket) => this.sanitizeTicketList(ticket, actor));
  }

  async create(payload: CreateTicketDto, actor: AuthenticatedUser) {
    const category = await this.requireActiveCategory(payload.categoryId);
    const now = new Date();

    const ticket = await this.prisma.ticket.create({
      data: {
        ticketNumber: this.generateTicketNumber(now),
        title: this.requireTrimmedText(payload.title, 'Title is required'),
        description: this.requireTrimmedText(payload.description, 'Description is required'),
        requesterId: actor.id,
        categoryId: category.id,
        priority: payload.priority ?? TicketPriority.MEDIUM,
        location: this.optionalTrimmedText(payload.location),
        assetTag: this.optionalTrimmedText(payload.assetTag),
      },
      include: ticketDetailInclude,
    });

    return this.sanitizeTicketDetail(ticket, actor);
  }

  async findOne(ticketId: string, actor: AuthenticatedUser) {
    const ticket = await this.requireTicketDetail(ticketId);
    this.ensureTicketAccessible(ticket, actor);

    return this.sanitizeTicketDetail(ticket, actor);
  }

  async assign(ticketId: string, payload: AssignTicketDto, actor: AuthenticatedUser) {
    this.ensureStaffActor(actor);
    const ticket = await this.requireTicket(ticketId);
    const assignee = await this.requireActiveStaffUser(payload.assignedToId, 'Assigned user must be a technician or admin');

    if (ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED) {
      throw new BadRequestException('Only open or in-progress tickets can be assigned');
    }

    if (ticket.assignedToId === assignee.id && ticket.status === TicketStatus.ASSIGNED) {
      throw new BadRequestException('Ticket is already assigned to that user');
    }

    const now = new Date();
    const shouldSetFirstResponse = ticket.firstResponseAt == null;

    await this.prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          assignedToId: assignee.id,
          status: TicketStatus.ASSIGNED,
          firstResponseAt: shouldSetFirstResponse ? now : undefined,
        },
      });

      await tx.ticketStatusHistory.create({
        data: {
          ticketId: ticket.id,
          changedById: actor.id,
          fromStatus: ticket.status,
          toStatus: TicketStatus.ASSIGNED,
          note: `Assigned to ${assignee.fullName}`,
        },
      });
    });

    return this.sanitizeTicketDetail(await this.requireTicketDetail(ticket.id), actor);
  }

  async updateStatus(ticketId: string, payload: UpdateTicketStatusDto, actor: AuthenticatedUser) {
    this.ensureStaffActor(actor);
    const ticket = await this.requireTicket(ticketId);
    const nextStatus = payload.status;
    const note = this.optionalTrimmedText(payload.note);
    const requestedResolutionSummary = this.optionalTrimmedText(payload.resolutionSummary);
    const requestedReopenReason = this.optionalTrimmedText(payload.reopenReason);

    if (ticket.status === nextStatus) {
      throw new BadRequestException('Ticket is already in that status');
    }

    const reopeningFromTerminalState =
      (ticket.status === TicketStatus.CLOSED && nextStatus !== TicketStatus.CLOSED) ||
      (ticket.status === TicketStatus.RESOLVED &&
        (nextStatus === TicketStatus.OPEN ||
          nextStatus === TicketStatus.ASSIGNED ||
          nextStatus === TicketStatus.IN_PROGRESS ||
          nextStatus === TicketStatus.PENDING_USER));

    if (reopeningFromTerminalState && !requestedReopenReason) {
      throw new BadRequestException('Reopen reason is required when changing a resolved or closed ticket to another status');
    }

    if (nextStatus === TicketStatus.CLOSED) {
      const effectiveResolutionSummary = requestedResolutionSummary ?? ticket.resolutionSummary?.trim();

      if (!effectiveResolutionSummary) {
        throw new BadRequestException('Resolution summary is required to close a ticket');
      }
    }

    const now = new Date();
    const shouldSetFirstResponse = ticket.firstResponseAt == null;
    const isClosing = nextStatus === TicketStatus.CLOSED;
    const isResolved = nextStatus === TicketStatus.RESOLVED;
    const isReopening = reopeningFromTerminalState;
    const effectiveResolutionSummary =
      isClosing ? (requestedResolutionSummary ?? ticket.resolutionSummary?.trim() ?? null) : requestedResolutionSummary;

    await this.prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          status: nextStatus,
          resolutionSummary: isReopening ? null : effectiveResolutionSummary ?? undefined,
          reopenReason: isReopening ? requestedReopenReason : undefined,
          firstResponseAt: shouldSetFirstResponse ? now : undefined,
          resolvedAt: isReopening ? (isResolved ? now : null) : isResolved || isClosing ? ticket.resolvedAt ?? now : undefined,
          closedAt: isReopening ? null : isClosing ? now : undefined,
        },
      });

      await tx.ticketStatusHistory.create({
        data: {
          ticketId: ticket.id,
          changedById: actor.id,
          fromStatus: ticket.status,
          toStatus: nextStatus,
          note: note ?? requestedResolutionSummary ?? requestedReopenReason ?? null,
        },
      });
    });

    return this.sanitizeTicketDetail(await this.requireTicketDetail(ticket.id), actor);
  }

  async addComment(ticketId: string, payload: CreateTicketCommentDto, actor: AuthenticatedUser) {
    const ticket = await this.requireTicketDetail(ticketId);
    this.ensureTicketAccessible(ticket, actor);
    const body = this.requireTrimmedText(payload.body, 'Comment body is required');
    const type = payload.type ?? CommentType.PUBLIC;

    if (!this.canCreateCommentType(actor.role, type)) {
      throw new BadRequestException('Only technicians and admins can add internal or resolution comments');
    }

    const now = new Date();
    const shouldSetFirstResponse = ticket.firstResponseAt == null && actor.role !== UserRole.REQUESTER;

    await this.prisma.$transaction(async (tx) => {
      await tx.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: actor.id,
          type,
          body,
        },
      });

      if (shouldSetFirstResponse) {
        await tx.ticket.update({
          where: { id: ticket.id },
          data: {
            firstResponseAt: now,
          },
        });
      }
    });

    return this.sanitizeTicketDetail(await this.requireTicketDetail(ticket.id), actor);
  }

  async uploadAttachment(ticketId: string, file: AttachmentUploadFile | undefined, actor: AuthenticatedUser) {
    if (!file) {
      throw new BadRequestException('Attachment file is required');
    }

    try {
      const ticket = await this.requireTicketDetail(ticketId);
      this.ensureTicketAccessible(ticket, actor);
      this.ensureSupportedAttachmentFile(file);
      const fileName = this.requireTrimmedText(file.originalname, 'Attachment file name is required');

      const now = new Date();
      const shouldSetFirstResponse = ticket.firstResponseAt == null && this.isStaffRole(actor.role);

      await this.prisma.$transaction(async (tx) => {
        await tx.attachment.create({
          data: {
            ticketId: ticket.id,
            uploadedById: actor.id,
            fileName,
            fileUrl: buildAttachmentFileUrl(file.path),
            mimeType: file.mimetype,
            fileSize: file.size,
          },
        });

        if (shouldSetFirstResponse) {
          await tx.ticket.update({
            where: { id: ticket.id },
            data: {
              firstResponseAt: now,
            },
          });
        }
      });

      return this.sanitizeTicketDetail(await this.requireTicketDetail(ticket.id), actor);
    } catch (error) {
      removeStoredAttachmentFile(file.path);
      throw error;
    }
  }

  private async requireTicket(ticketId: string) {
    if (!isUUID(ticketId)) {
      throw new BadRequestException('Invalid ticket id');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  private async requireTicketDetail(ticketId: string) {
    if (!isUUID(ticketId)) {
      throw new BadRequestException('Invalid ticket id');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: ticketDetailInclude,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  private async requireActiveStaffUser(userId?: string, errorMessage = 'User not found') {
    const user = await this.requireUser(userId, errorMessage);

    if (!user.isActive) {
      throw new BadRequestException('User is inactive');
    }

    if (!this.isStaffRole(user.role)) {
      throw new BadRequestException('User must be a technician or admin');
    }

    return user;
  }

  private async requireUser(userId?: string, errorMessage = 'User not found') {
    if (!userId) {
      throw new BadRequestException(errorMessage);
    }

    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(errorMessage);
    }

    return user;
  }

  private async requireActiveCategory(categoryId: string) {
    if (!isUUID(categoryId)) {
      throw new BadRequestException('Invalid category id');
    }

    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private requireTrimmedText(value: string, errorMessage: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new BadRequestException(errorMessage);
    }

    return trimmed;
  }

  private optionalTrimmedText(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private ensureSupportedAttachmentFile(file: AttachmentUploadFile) {
    if (file.size > ATTACHMENT_MAX_BYTES) {
      throw new BadRequestException('Attachment file is too large');
    }

    if (!isSupportedAttachmentFile(file.originalname, file.mimetype)) {
      throw new BadRequestException('Only png, jpg, jpeg, heic, and pdf attachments are allowed');
    }
  }

  private canCreateCommentType(role: UserRole, type: CommentType) {
    if (type === CommentType.PUBLIC) {
      return true;
    }

    return this.isStaffRole(role);
  }

  private ensureStaffActor(actor: AuthenticatedUser) {
    if (!this.isStaffRole(actor.role)) {
      throw new BadRequestException('Only technicians and admins can perform this action');
    }
  }

  private ensureTicketAccessible(ticket: { requesterId: string }, actor: AuthenticatedUser) {
    if (this.isStaffRole(actor.role)) {
      return;
    }

    if (ticket.requesterId !== actor.id) {
      throw new NotFoundException('Ticket not found');
    }
  }

  private ticketAccessWhere(actor: AuthenticatedUser): Prisma.TicketWhereInput | undefined {
    if (this.isStaffRole(actor.role)) {
      return undefined;
    }

    return {
      requesterId: actor.id,
    };
  }

  private sanitizeTicketList<TTicket extends { rootCause?: string | null; reopenReason?: string | null }>(
    ticket: TTicket,
    actor: AuthenticatedUser,
  ) {
    if (this.isStaffRole(actor.role)) {
      return ticket;
    }

    return {
      ...ticket,
      rootCause: null,
      reopenReason: null,
    };
  }

  private sanitizeTicketDetail<
    TTicket extends {
      rootCause?: string | null;
      reopenReason?: string | null;
      comments?: Array<{ type: CommentType }>;
    },
  >(ticket: TTicket, actor: AuthenticatedUser) {
    if (this.isStaffRole(actor.role)) {
      return ticket;
    }

    return {
      ...ticket,
      rootCause: null,
      reopenReason: null,
      comments: ticket.comments?.filter((comment) => comment.type !== CommentType.INTERNAL_NOTE),
    };
  }

  private isStaffRole(role: UserRole) {
    return role === UserRole.TECHNICIAN || role === UserRole.ADMIN;
  }

  private generateTicketNumber(date = new Date()) {
    const stamp = date.toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = randomBytes(3).toString('hex').toUpperCase();
    return `IR-${stamp}-${suffix}`;
  }
}
