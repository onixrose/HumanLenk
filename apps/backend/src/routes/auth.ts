import express from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../index";
import { AppError, asyncHandler } from "../middleware/error-handler";
import { generateToken, authenticate, AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Register endpoint
router.post("/register", asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  const { email, password, name } = validatedData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User already exists with this email", 409);
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "USER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = generateToken(user.id);

  logger.info("User registered successfully", {
    userId: user.id,
    email: user.email,
    ip: req.ip,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      token,
    },
  });
}));

// Login endpoint
router.post("/login", asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  const { email, password } = validatedData;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    logger.warn("Failed login attempt", {
      email,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    throw new AppError("Invalid email or password", 401);
  }

  // Generate JWT token
  const token = generateToken(user.id);

  // Update user's last login (optional)
  await prisma.user.update({
    where: { id: user.id },
    data: { updatedAt: new Date() },
  });

  logger.info("User logged in successfully", {
    userId: user.id,
    email: user.email,
    ip: req.ip,
  });

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: userWithoutPassword,
      token,
    },
  });
}));

// Get current user profile
router.get("/me", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
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

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({
    success: true,
    data: user,
  });
}));

// Update user profile
router.patch("/me", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const updateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
  });

  const validatedData = updateSchema.parse(req.body);

  // Check if email is already taken by another user
  if (validatedData.email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        id: { not: req.user!.id },
      },
    });

    if (existingUser) {
      throw new AppError("Email already taken", 409);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data: validatedData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      updatedAt: true,
    },
  });

  logger.info("User profile updated", {
    userId: req.user!.id,
    changes: Object.keys(validatedData),
  });

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
}));

// Change password
router.post("/change-password", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  });

  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);

  if (!isValidPassword) {
    throw new AppError("Current password is incorrect", 401);
  }

  // Hash new password
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  logger.info("Password changed successfully", {
    userId: user.id,
    email: user.email,
  });

  res.json({
    success: true,
    message: "Password changed successfully",
  });
}));

export { router as authRoutes };
