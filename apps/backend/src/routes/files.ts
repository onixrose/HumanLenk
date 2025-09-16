import express from "express";
import multer from "multer";
import { z } from "zod";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../index";
import { AppError, asyncHandler } from "../middleware/error-handler";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.", 400));
    }
  },
});

// File upload endpoint
router.post("/upload", authenticate, upload.single("file") as any, asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    throw new AppError("No file provided", 400);
  }

  const userId = req.user!.id;
  const file = req.file;
  
  // Generate unique filename
  const fileExtension = file.originalname.split(".").pop();
  const uniqueFileName = `${userId}/${uuidv4()}.${fileExtension}`;

  try {
    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: "AES256",
      Metadata: {
        userId,
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    };

    const s3Result = await s3.upload(uploadParams).promise();

    // Save file metadata to database
    const savedFile = await prisma.file.create({
      data: {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        url: s3Result.Location,
        s3Key: uniqueFileName,
        status: "COMPLETED", // For now, mark as completed. Later add processing logic
        userId,
      },
    });

    logger.info("File uploaded successfully", {
      fileId: savedFile.id,
      fileName: file.originalname,
      fileSize: file.size,
      userId,
      s3Key: uniqueFileName,
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: savedFile,
    });
  } catch (error) {
    logger.error("File upload failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      fileName: file.originalname,
      userId,
    });

    if (error instanceof Error && error.message.includes("AWS")) {
      throw new AppError("File upload service unavailable", 503);
    }
    
    throw new AppError("Failed to upload file", 500);
  }
}));

// Get user's files
router.get("/", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const querySchema = z.object({
    limit: z.string().optional().transform((val) => val ? parseInt(val) : 20),
    offset: z.string().optional().transform((val) => val ? parseInt(val) : 0),
    status: z.enum(["UPLOADING", "PROCESSING", "COMPLETED", "ERROR"]).optional(),
    type: z.string().optional(),
  });

  const { limit, offset, status, type } = querySchema.parse(req.query);
  const userId = req.user!.id;

  const where: any = { userId };
  if (status) where.status = status;
  if (type) where.type = { contains: type };

  const files = await prisma.file.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      name: true,
      type: true,
      size: true,
      url: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  const total = await prisma.file.count({ where });

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

// Get specific file details
router.get("/:fileId", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { fileId } = req.params;
  const userId = req.user!.id;

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  res.json({
    success: true,
    data: file,
  });
}));

// Generate signed URL for file download
router.get("/:fileId/download", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { fileId } = req.params;
  const userId = req.user!.id;

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  try {
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: file.s3Key,
      Expires: 60 * 60, // 1 hour
      ResponseContentDisposition: `attachment; filename="${file.name}"`,
    });

    logger.info("Signed URL generated for file download", {
      fileId,
      fileName: file.name,
      userId,
    });

    res.json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        expiresIn: 3600, // seconds
      },
    });
  } catch (error) {
    logger.error("Failed to generate signed URL", {
      error: error instanceof Error ? error.message : "Unknown error",
      fileId,
      userId,
    });

    throw new AppError("Failed to generate download link", 500);
  }
}));

// Delete file
router.delete("/:fileId", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { fileId } = req.params;
  const userId = req.user!.id;

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  try {
    // Delete from S3
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: file.s3Key,
    }).promise();

    // Delete from database (this will also delete related messages due to CASCADE)
    await prisma.file.delete({
      where: { id: fileId },
    });

    logger.info("File deleted successfully", {
      fileId,
      fileName: file.name,
      userId,
      s3Key: file.s3Key,
    });

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    logger.error("File deletion failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      fileId,
      userId,
    });

    throw new AppError("Failed to delete file", 500);
  }
}));

// Get file statistics
router.get("/stats", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  const stats = await prisma.file.groupBy({
    by: ["status", "type"],
    where: { userId },
    _count: {
      id: true,
    },
    _sum: {
      size: true,
    },
  });

  const totalFiles = await prisma.file.count({
    where: { userId },
  });

  const totalSize = await prisma.file.aggregate({
    where: { userId },
    _sum: {
      size: true,
    },
  });

  res.json({
    success: true,
    data: {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      byStatus: stats.reduce((acc, stat) => {
        if (!acc[stat.status]) acc[stat.status] = { count: 0, size: 0 };
        acc[stat.status].count += stat._count.id;
        acc[stat.status].size += stat._sum.size || 0;
        return acc;
      }, {} as Record<string, { count: number; size: number }>),
      byType: stats.reduce((acc, stat) => {
        if (!acc[stat.type]) acc[stat.type] = { count: 0, size: 0 };
        acc[stat.type].count += stat._count.id;
        acc[stat.type].size += stat._sum.size || 0;
        return acc;
      }, {} as Record<string, { count: number; size: number }>),
    },
  });
}));

export { router as fileRoutes };
