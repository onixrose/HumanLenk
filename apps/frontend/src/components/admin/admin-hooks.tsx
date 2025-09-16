import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@humanlenk/api-client";

// Admin users hook
export const useAdminUsers = (params?: {
  limit?: number;
  offset?: number;
  role?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.offset) searchParams.append("offset", params.offset.toString());
      if (params?.role) searchParams.append("role", params.role);
      if (params?.search) searchParams.append("search", params.search);

      const response = await apiClient.request(`/admin/users?${searchParams.toString()}`);
      return response.data;
    },
    enabled: true,
  });
};

// Admin files hook
export const useAdminFiles = (params?: {
  limit?: number;
  offset?: number;
  status?: string;
  type?: string;
  userId?: string;
}) => {
  return useQuery({
    queryKey: ["admin", "files", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.offset) searchParams.append("offset", params.offset.toString());
      if (params?.status) searchParams.append("status", params.status);
      if (params?.type) searchParams.append("type", params.type);
      if (params?.userId) searchParams.append("userId", params.userId);

      const response = await apiClient.request(`/admin/files?${searchParams.toString()}`);
      return response.data;
    },
    enabled: true,
  });
};

// Admin stats hook
export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await apiClient.request("/admin/stats");
      return response.data;
    },
    enabled: true,
  });
};

// Admin surveys hook
export const useAdminSurveys = (params?: {
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ["admin", "surveys", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.offset) searchParams.append("offset", params.offset.toString());

      const response = await apiClient.request(`/admin/surveys?${searchParams.toString()}`);
      return response.data;
    },
    enabled: true,
  });
};
