import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  File,
  Message,
  ApiResponse,
  ChatRequest,
  ChatResponse,
  AdminStats,
  Survey,
} from "@humanlenk/types";

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    this.setToken(null);
  }

  // Chat methods
  async sendMessage(data: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMessages(): Promise<ApiResponse<Message[]>> {
    return this.request<Message[]>("/messages");
  }

  // File methods
  async uploadFile(file: FormData): Promise<ApiResponse<File>> {
    return this.request<File>("/files/upload", {
      method: "POST",
      body: file,
        headers: {} as Record<string, string>, // Remove Content-Type to let browser set it for FormData
    });
  }

  async getFiles(): Promise<ApiResponse<File[]>> {
    return this.request<File[]>("/files");
  }

  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}`, {
      method: "DELETE",
    });
  }

  // Admin methods
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>("/admin/users");
  }

  async getAdminFiles(): Promise<ApiResponse<File[]>> {
    return this.request<File[]>("/admin/files");
  }

  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    return this.request<AdminStats>("/admin/stats");
  }

  // Survey methods
  async submitSurvey(survey: Omit<Survey, "id" | "createdAt">): Promise<ApiResponse<Survey>> {
    return this.request<Survey>("/surveys", {
      method: "POST",
      body: JSON.stringify(survey),
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// React Query hooks
export const useAuth = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => apiClient.login(credentials),
    onSuccess: (response) => {
      if (response.success && response.data) {
        apiClient.setToken(response.data.token);
        queryClient.setQueryData(["user"], response.data.user);
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => apiClient.register(userData),
    onSuccess: (response) => {
      if (response.success && response.data) {
        apiClient.setToken(response.data.token);
        queryClient.setQueryData(["user"], response.data.user);
      }
    },
  });

  const logout = () => {
    apiClient.logout();
    queryClient.clear();
  };

  return {
    login: loginMutation,
    register: registerMutation,
    logout,
  };
};

export const useMessages = () => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const response = await apiClient.getMessages();
      return response.data || [];
    },
  });
};

export const useChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChatRequest) => apiClient.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export const useFiles = () => {
  return useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const response = await apiClient.getFiles();
      return response.data || [];
    },
  });
};

export const useFileUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: FormData) => apiClient.uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => apiClient.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};

// Admin hooks
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await apiClient.getUsers();
      return response.data || [];
    },
  });
};

export const useAdminFiles = () => {
  return useQuery({
    queryKey: ["admin", "files"],
    queryFn: async () => {
      const response = await apiClient.getAdminFiles();
      return response.data || [];
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await apiClient.getAdminStats();
      return response.data;
    },
  });
};

export const useSurveySubmission = () => {
  return useMutation({
    mutationFn: (survey: Omit<Survey, "id" | "createdAt">) => 
      apiClient.submitSurvey(survey),
  });
};

export { ApiClient };
export default apiClient;
