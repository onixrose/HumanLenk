// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// Authentication types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// File types
export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  s3Key: string;
  status: "uploading" | "processing" | "completed" | "error";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message types
export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  fileId?: string;
  userId: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Chat types
export interface ChatRequest {
  message: string;
  fileId?: string;
}

export interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  totalFiles: number;
  totalMessages: number;
  activeUsers: number;
}

// Survey types
export interface Survey {
  id: string;
  userId: string;
  rating: number;
  feedback: string;
  createdAt: Date;
}
