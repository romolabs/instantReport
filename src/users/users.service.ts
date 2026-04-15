import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  department: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

type PublicUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: [{ createdAt: 'desc' }, { fullName: 'asc' }],
    });
  }

  async create(payload: CreateUserDto): Promise<PublicUser> {
    const fullName = this.normalizeRequiredText(payload.fullName, 'fullName');
    const email = this.normalizeEmail(payload.email);
    const passwordHash = await argon2.hash(payload.password);
    const department = this.normalizeOptionalText(payload.department, 'department');
    const role = payload.role ?? UserRole.REQUESTER;

    try {
      return await this.prisma.user.create({
        data: {
          fullName,
          email,
          passwordHash,
          department,
          role,
        },
        select: userSelect,
      });
    } catch (error) {
      this.handleKnownPrismaError(error, 'A user with this email already exists');
      throw error;
    }
  }

  async update(userId: string, payload: UpdateUserDto): Promise<PublicUser> {
    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const data: Prisma.UserUpdateInput = {};

    if (payload.fullName !== undefined) {
      data.fullName = this.normalizeRequiredText(payload.fullName, 'fullName');
    }

    if (payload.department !== undefined) {
      data.department = this.normalizeOptionalText(payload.department, 'department');
    }

    if (payload.role !== undefined) {
      data.role = payload.role;
    }

    if (payload.isActive !== undefined) {
      data.isActive = payload.isActive;
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data,
        select: userSelect,
      });
    } catch (error) {
      this.handleKnownPrismaError(error, 'Unable to update user');
      throw error;
    }
  }

  private normalizeRequiredText(value: string, fieldName: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new BadRequestException(`${fieldName} cannot be empty`);
    }

    return normalized;
  }

  private normalizeOptionalText(value: string | undefined, fieldName: string): string | undefined {
    const normalized = value?.trim();

    if (normalized === undefined) {
      return undefined;
    }

    if (!normalized) {
      throw new BadRequestException(`${fieldName} cannot be empty`);
    }

    return normalized;
  }

  private normalizeEmail(value: string): string {
    return this.normalizeRequiredText(value, 'email').toLowerCase();
  }

  private handleKnownPrismaError(error: unknown, conflictMessage: string): void {
    if (this.isUniqueConstraintError(error)) {
      throw new ConflictException(conflictMessage);
    }
  }

  private isUniqueConstraintError(error: unknown): error is { code: string } {
    return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'P2002';
  }
}
