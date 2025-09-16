import express from "express";
import { z } from "zod";
import { prisma } from "../index";
import { AppError, asyncHandler } from "../middleware/error-handler";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = express.Router();

// Validation schema
const surveySchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().min(1, "Feedback cannot be empty").max(1000, "Feedback too long"),
});

// Submit survey/feedback
router.post("/", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { rating, feedback } = surveySchema.parse(req.body);
  const userId = req.user!.id;

  // Check if user has already submitted a survey recently (within 24 hours)
  const recentSurvey = await prisma.survey.findFirst({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      },
    },
  });

  if (recentSurvey) {
    throw new AppError("You can only submit one survey per day", 429);
  }

  const survey = await prisma.survey.create({
    data: {
      rating,
      feedback,
      userId,
    },
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

  logger.info("Survey submitted", {
    surveyId: survey.id,
    rating,
    userId,
    userEmail: survey.user.email,
  });

  res.status(201).json({
    success: true,
    message: "Survey submitted successfully",
    data: survey,
  });
}));

// Get user's surveys
router.get("/my", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  const surveys = await prisma.survey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      feedback: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: surveys,
  });
}));

// Get survey statistics (public endpoint)
router.get("/stats", asyncHandler(async (req, res) => {
  const [totalSurveys, averageRating, ratingDistribution] = await Promise.all([
    prisma.survey.count(),
    
    prisma.survey.aggregate({
      _avg: { rating: true },
    }),
    
    prisma.survey.groupBy({
      by: ["rating"],
      _count: { id: true },
      orderBy: { rating: "asc" },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalSurveys,
      averageRating: Math.round((averageRating._avg.rating || 0) * 100) / 100,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item.rating] = item._count.id;
        return acc;
      }, {} as Record<number, number>),
    },
  });
}));

export { router as surveyRoutes };
