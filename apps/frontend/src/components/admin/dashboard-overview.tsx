"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface DashboardOverviewProps {
  stats: any;
  isLoading: boolean;
}

export function DashboardOverview({ stats, isLoading }: DashboardOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: "Total Users",
      value: stats?.overview?.totalUsers || 0,
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Total Files",
      value: stats?.overview?.totalFiles || 0,
      icon: FileText,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Total Messages",
      value: stats?.overview?.totalMessages || 0,
      icon: MessageSquare,
      change: "+15%",
      changeType: "positive" as const,
    },
    {
      title: "Active Users",
      value: stats?.overview?.activeUsers || 0,
      icon: TrendingUp,
      change: "+5%",
      changeType: "positive" as const,
    },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge 
                    variant={card.changeType === "positive" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {card.change}
                  </Badge>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Files by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Files by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.filesByStatus && Object.entries(stats.filesByStatus).map(([status, data]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {status === "processing" && <Clock className="h-4 w-4 text-yellow-500" />}
                    {status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <span className="capitalize">{status}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{data.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(data.totalSize)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.usersByRole && Object.entries(stats.usersByRole).map(([role, count]: [string, number]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      role === "admin" ? "bg-red-500" : "bg-blue-500"
                    )} />
                    <span className="capitalize">{role}s</span>
                  </div>
                  <div className="font-medium">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent?.users?.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent?.files?.slice(0, 5).map((file: any) => (
                <div key={file.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {file.user?.name} • {formatFileSize(file.size)}
                    </div>
                  </div>
                  <Badge variant="outline">{file.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
