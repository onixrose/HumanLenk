"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Download,
  // Trash2,
  FileText,
  FileImage,
  FileIcon,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface FilesTableProps {
  files: any;
  isLoading: boolean;
}

export function FilesTable({ files, isLoading }: FilesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredFiles = files?.files?.filter((file: any) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || file.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }) || [];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <FileImage className="h-4 w-4" />;
    if (type.includes("text") || type.includes("pdf") || type.includes("document")) {
      return <FileText className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PROCESSING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Files ({files?.pagination?.total || 0})</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex space-x-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === "processing" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("processing")}
            >
              Processing
            </Button>
            <Button
              variant={statusFilter === "error" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("error")}
            >
              Error
            </Button>
          </div>

          {/* Files List */}
          <div className="space-y-3">
            {filteredFiles.map((file: any) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {file.user?.name} • {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {file._count?.messages || 0} messages
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(file.status)}
                    <Badge 
                      variant={
                        file.status === "COMPLETED" ? "default" :
                        file.status === "PROCESSING" ? "secondary" : "destructive"
                      }
                    >
                      {file.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {files?.pagination && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {files.pagination.offset + 1} to{" "}
                {Math.min(files.pagination.offset + files.pagination.limit, files.pagination.total)} of{" "}
                {files.pagination.total} files
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={files.pagination.offset === 0}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!files.pagination.hasMore}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
