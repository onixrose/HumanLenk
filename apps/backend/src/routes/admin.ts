import express from "express";
import { z } from "zod";
import { prisma } from "../index";
import { AppError, asyncHandler } from "../middleware/error-handler";
import { authenticate, requireAdmin, AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

// Get all users with pagination
router.get("/users", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const querySchema = z.object({
    limit: z.string().optional().transform((val) => val ? parseInt(val) : 20),
    offset: z.string().optional().transform((val) => val ? parseInt(val) : 0),
    role: z.enum(["USER", "ADMIN"]).optional(),
    search: z.string().optional(),
  });

  const { limit, offset, role, search } = querySchema.parse(req.query);

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          files: true,
          messages: true,
          surveys: true,
        },
      },
    },
  });

  const total = await prisma.user.count({ where });

  logger.info("Admin accessed users list", {
    adminId: req.user!.id,
    filters: { role, search },
    resultCount: users.length,
  });

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    },
  });
}));

// Get specific user details
router.get("/users/:userId", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      files: {
        select: {
          id: true,
          name: true,
          type: true,
          size: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      messages: {
        select: {
          id: true,
          content: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      surveys: {
        select: {
          id: true,
          rating: true,
          feedback: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          files: true,
          messages: true,
          surveys: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  logger.info("Admin accessed user details", {
    adminId: req.user!.id,
    targetUserId: userId,
  });

  res.json({
    success: true,
    data: user,
  });
}));

// Update user role
router.patch("/users/:userId/role", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;
  const roleSchema = z.object({
    role: z.enum(["USER", "ADMIN"]),
  });

  const { role } = roleSchema.parse(req.body);

  // Prevent admin from demoting themselves
  if (userId === req.user!.id && role === "USER") {
    throw new AppError("Cannot demote yourself", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      updatedAt: true,
    },
  });

  logger.warn("User role updated by admin", {
    adminId: req.user!.id,
    targetUserId: userId,
    oldRole: user.role,
    newRole: role,
    targetEmail: user.email,
  });

  res.json({
    success: true,
    message: "User role updated successfully",
    data: updatedUser,
  });
}));

// Delete user
router.delete("/users/:userId", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;

  // Prevent admin from deleting themselves
  if (userId === req.user!.id) {
    throw new AppError("Cannot delete yourself", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Delete user (cascade will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  logger.warn("User deleted by admin", {
    adminId: req.user!.id,
    deletedUserId: userId,
    deletedUserEmail: user.email,
  });

  res.json({
    success: true,
    message: "User deleted successfully",
  });
}));

// Get all files with pagination
router.get("/files", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const querySchema = z.object({
    limit: z.string().optional().transform((val) => val ? parseInt(val) : 20),
    offset: z.string().optional().transform((val) => val ? parseInt(val) : 0),
    status: z.enum(["UPLOADING", "PROCESSING", "COMPLETED", "ERROR"]).optional(),
    type: z.string().optional(),
    userId: z.string().optional(),
  });

  const { limit, offset, status, type, userId } = querySchema.parse(req.query);

  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = { contains: type };
  if (userId) where.userId = userId;

  const files = await prisma.file.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  const total = await prisma.file.count({ where });

  logger.info("Admin accessed files list", {
    adminId: req.user!.id,
    filters: { status, type, userId },
    resultCount: files.length,
  });

  res.json({
    success: true,
    data: {
      files,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    },
  });
}));

// Delete file (admin)
router.delete("/files/:fileId", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { fileId } = req.params;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  // Delete file (cascade will handle related records)
  await prisma.file.delete({
    where: { id: fileId },
  });

  logger.warn("File deleted by admin", {
    adminId: req.user!.id,
    fileId,
    fileName: file.name,
    fileOwnerEmail: file.user.email,
  });

  res.json({
    success: true,
    message: "File deleted successfully",
  });
}));

// Get admin dashboard statistics
router.get("/stats", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const [
    totalUsers,
    totalFiles,
    totalMessages,
    userStats,
    fileStats,
    messageStats,
    recentUsers,
    recentFiles,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.file.count(),
    prisma.message.count(),
    
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
    
    prisma.file.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { size: true },
    }),
    
    prisma.message.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
    
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    }),
    
    prisma.file.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const activeUsers = await prisma.user.count({
    where: {
      updatedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
  });

  logger.info("Admin accessed dashboard stats", {
    adminId: req.user!.id,
  });

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalFiles,
        totalMessages,
        activeUsers,
      },
      usersByRole: userStats.reduce((acc, stat) => {
        acc[stat.role.toLowerCase()] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      filesByStatus: fileStats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = {
          count: stat._count.id,
          totalSize: stat._sum.size || 0,
        };
        return acc;
      }, {} as Record<string, { count: number; totalSize: number }>),
      messagesByRole: messageStats.reduce((acc, stat) => {
        acc[stat.role.toLowerCase()] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      recent: {
        users: recentUsers,
        files: recentFiles,
      },
    },
  });
}));

// Get surveys/feedback
router.get("/surveys", asyncHandler(async (req: AuthenticatedRequest, res) => {
  const querySchema = z.object({
    limit: z.string().optional().transform((val) => val ? parseInt(val) : 20),
    offset: z.string().optional().transform((val) => val ? parseInt(val) : 0),
  });

  const { limit, offset } = querySchema.parse(req.query);

  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  const total = await prisma.survey.count();

  const averageRating = await prisma.survey.aggregate({
    _avg: { rating: true },
  });

  logger.info("Admin accessed surveys", {
    adminId: req.user!.id,
    resultCount: surveys.length,
  });

  res.json({
    success: true,
    data: {
      surveys,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      averageRating: averageRating._avg.rating || 0,
    },
  });
}));

export { router as adminRoutes };
