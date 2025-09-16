import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../index";
import { AppError, asyncHandler } from "./error-handler";
import { logger } from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authenticate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Access token required", 401);
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      throw new AppError("Access token required", 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        throw new AppError("User not found", 401);
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid access token", 401);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Access token expired", 401);
      }
      throw error;
    }
  }
);

export const requireAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    if (req.user.role !== "ADMIN") {
      logger.warn("Unauthorized admin access attempt", {
        userId: req.user.id,
        email: req.user.email,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });
      throw new AppError("Admin access required", 403);
    }

    next();
  }
);

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: "humanlenk-api",
      audience: "humanlenk-client",
    }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
