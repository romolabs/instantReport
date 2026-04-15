import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';

const categorySelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

type PublicCategory = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PublicCategory[]> {
    return this.prisma.category.findMany({
      select: categorySelect,
      orderBy: { name: 'asc' },
    });
  }

  async create(payload: CreateCategoryDto): Promise<PublicCategory> {
    const name = this.normalizeRequiredText(payload.name, 'name');
    const description = this.normalizeOptionalText(payload.description, 'description');

    try {
      return await this.prisma.category.create({
        data: {
          name,
          description,
        },
        select: categorySelect,
      });
    } catch (error) {
      this.handleKnownPrismaError(error, 'A category with this name already exists');
      throw error;
    }
  }

  async update(categoryId: string, payload: UpdateCategoryDto): Promise<PublicCategory> {
    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existingCategory = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    const data: Prisma.CategoryUpdateInput = {};

    if (payload.name !== undefined) {
      data.name = this.normalizeRequiredText(payload.name, 'name');
    }

    if (payload.description !== undefined) {
      data.description = this.normalizeOptionalText(payload.description, 'description');
    }

    if (payload.isActive !== undefined) {
      data.isActive = payload.isActive;
    }

    try {
      return await this.prisma.category.update({
        where: { id: categoryId },
        data,
        select: categorySelect,
      });
    } catch (error) {
      this.handleKnownPrismaError(error, 'A category with this name already exists');
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

  private handleKnownPrismaError(error: unknown, conflictMessage: string): void {
    if (this.isUniqueConstraintError(error)) {
      throw new ConflictException(conflictMessage);
    }
  }

  private isUniqueConstraintError(error: unknown): error is { code: string } {
    return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'P2002';
  }
}
