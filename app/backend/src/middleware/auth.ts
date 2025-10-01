import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { prisma } from '../db/prisma.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'ADMIN' | 'USER';
  };
}

export function requireAuth() {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.auth_token;
      if (!token) {
        throw new AppError(401, 'Authentication required', 'UNAUTHENTICATED');
      }
      const payload = jwt.verify(token, env.jwtSecret) as {
        userId: string;
        role: 'ADMIN' | 'USER';
      };

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'User is not active', 'USER_INACTIVE');
      }

      req.user = { id: user.id, role: user.role };
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }
      next(new AppError(401, 'Invalid authentication token', 'INVALID_TOKEN'));
    }
  };
}

export function requireRole(role: 'ADMIN' | 'USER') {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', 'UNAUTHENTICATED'));
    }
    if (req.user.role !== role) {
      return next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
    }
    next();
  };
}
