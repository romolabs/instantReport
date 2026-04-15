import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { type User } from '@prisma/client';
// @ts-expect-error passport-jwt does not ship TypeScript declarations in this project
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../../prisma/prisma.service';
import { JWT_STRATEGY_NAME } from '../constants';
import { type AuthenticatedUser, type JwtAuthPayload } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-jwt-secret'),
    });
  }

  async validate(payload: JwtAuthPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or inactive token');
    }

    if (payload.email !== user.email || payload.role !== user.role) {
      throw new UnauthorizedException('Token claims do not match the current user');
    }

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      department: user.department,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
