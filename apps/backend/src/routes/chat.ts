import express from "express";
import { z } from "zod";
import { OpenAI } from "openai";
import { prisma } from "../index";
import { AppError, asyncHandler } from "../middleware/error-handler";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = express.Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Validation schemas
const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(4000, "Message too long"),
  chatSessionId: z.string(),
  fileId: z.string().optional(),
});

const createChatSessionSchema = z.object({
  title: z.string().optional(),
});

const getMessagesSchema = z.object({
  chatSessionId: z.string(),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 50),
  offset: z.string().optional().transform((val) => val ? parseInt(val) : 0),
});

// Create new chat session
router.post("/sessions", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { title } = createChatSessionSchema.parse(req.body);
  const userId = req.user!.id;

  const chatSession = await prisma.chatSession.create({
    data: {
      title: title || "New Chat",
      userId,
    },
  });

  res.json({
    success: true,
    data: chatSession,
  });
}));

// Get user's chat sessions
router.get("/sessions", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  const chatSessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // Get last message for preview
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  // Format for frontend
  const formattedSessions = chatSessions.map(session => ({
    id: session.id,
    title: session.title,
    lastMessage: session.messages[0]?.content || "No messages yet",
    timestamp: session.updatedAt,
    messageCount: session._count.messages,
  }));

  res.json({
    success: true,
    data: formattedSessions,
  });
}));

// Delete chat session
router.delete("/sessions/:sessionId", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { sessionId } = req.params;
  const userId = req.user!.id;

  // Verify ownership
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new AppError("Chat session not found", 404);
  }

  await prisma.chatSession.delete({
    where: { id: sessionId },
  });

  res.json({
    success: true,
    message: "Chat session deleted successfully",
  });
}));

// Send chat message
router.post("/", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { message, chatSessionId, fileId } = chatMessageSchema.parse(req.body);
  const userId = req.user!.id;

  // Verify chat session ownership
  const chatSession = await prisma.chatSession.findFirst({
    where: { id: chatSessionId, userId },
  });

  if (!chatSession) {
    throw new AppError("Chat session not found", 404);
  }

  // Validate file ownership if fileId is provided
  let file = null;
  if (fileId) {
    file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
        status: "COMPLETED",
      },
    });

    if (!file) {
      throw new AppError("File not found or not accessible", 404);
    }
  }

  // Save user message
  const userMessage = await prisma.message.create({
    data: {
      content: message,
      role: "USER",
      userId,
      chatSessionId,
      fileId: fileId || null,
    },
  });

  // Generate AI response
  let aiResponse = "I'm sorry, but I'm not able to process your request right now. Please try again later.";
  
  if (openai) {
    try {
      // Build conversation context
      const recentMessages = await prisma.message.findMany({
        where: { userId, chatSessionId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          file: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      });

      // Reverse to get chronological order
      recentMessages.reverse();

      // Build messages for OpenAI
      const messages: any[] = [
        {
          role: "system",
          content: `You are HumanLenk, a helpful AI assistant that can summarize, edit, and clarify content. 
          You can also help with file analysis when files are provided. 
          Be concise, helpful, and professional in your responses.
          ${file ? `The user has referenced a file: ${file.name} (${file.type})` : ""}`,
        },
      ];

      // Add conversation history
      for (const msg of recentMessages.slice(-6)) { // Last 6 messages for context
        messages.push({
          role: msg.role.toLowerCase(),
          content: msg.content,
        });
      }

      // Add current message
      messages.push({
        role: "user",
        content: message,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      aiResponse = completion.choices[0]?.message?.content || aiResponse;

      logger.info("OpenAI API call successful", {
        userId,
        messageLength: message.length,
        responseLength: aiResponse.length,
        fileId: fileId || null,
      });
    } catch (error) {
      logger.error("OpenAI API error", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      // Keep default error message
    }
  } else {
    logger.warn("OpenAI API key not configured, using placeholder response");
  }

  // Save AI response
  const assistantMessage = await prisma.message.create({
    data: {
      content: aiResponse,
      role: "ASSISTANT",
      userId,
      chatSessionId,
      fileId: fileId || null,
    },
  });

  // Update chat session timestamp
  await prisma.chatSession.update({
    where: { id: chatSessionId },
    data: { updatedAt: new Date() },
  });

  res.json({
    success: true,
    data: {
      userMessage,
      assistantMessage,
    },
  });
}));

// Get chat messages
router.get("/messages", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { chatSessionId, limit, offset } = getMessagesSchema.parse(req.query);
  const userId = req.user!.id;

  // Verify chat session ownership
  const chatSession = await prisma.chatSession.findFirst({
    where: { id: chatSessionId, userId },
  });

  if (!chatSession) {
    throw new AppError("Chat session not found", 404);
  }

  const messages = await prisma.message.findMany({
    where: { userId, chatSessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      file: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  // Reverse to get chronological order
  messages.reverse();

  const total = await prisma.message.count({
    where: { userId, chatSessionId },
  });

  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    },
  });
}));

// Delete a message
router.delete("/messages/:messageId", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { messageId } = req.params;
  const userId = req.user!.id;

  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      userId,
    },
  });

  if (!message) {
    throw new AppError("Message not found", 404);
  }

  await prisma.message.delete({
    where: { id: messageId },
  });

  logger.info("Message deleted", {
    messageId,
    userId,
  });

  res.json({
    success: true,
    message: "Message deleted successfully",
  });
}));

// Clear all messages for user
router.delete("/messages", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  const deletedCount = await prisma.message.deleteMany({
    where: { userId },
  });

  logger.info("All messages cleared", {
    userId,
    deletedCount: deletedCount.count,
  });

  res.json({
    success: true,
    message: `Deleted ${deletedCount.count} messages`,
  });
}));

// Get chat statistics
router.get("/stats", authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  const stats = await prisma.message.groupBy({
    by: ["role"],
    where: { userId },
    _count: {
      id: true,
    },
  });

  const totalMessages = await prisma.message.count({
    where: { userId },
  });

  const firstMessage = await prisma.message.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  res.json({
    success: true,
    data: {
      totalMessages,
      messagesByRole: stats.reduce((acc, stat) => {
        acc[stat.role.toLowerCase()] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      firstMessageDate: firstMessage?.createdAt || null,
    },
  });
}));

export { router as chatRoutes };
