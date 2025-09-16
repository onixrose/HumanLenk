"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  User, 
  Shield,
  // Trash2,
  Edit
} from "lucide-react";

interface UsersTableProps {
  users: any;
  isLoading: boolean;
}

export function UsersTable({ users, isLoading }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredUsers = users?.users?.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Users ({users?.pagination?.total || 0})</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
          {/* Role Filter */}
          <div className="flex space-x-2">
            <Button
              variant={roleFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter("all")}
            >
              All
            </Button>
            <Button
              variant={roleFilter === "user" ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter("user")}
            >
              Users
            </Button>
            <Button
              variant={roleFilter === "admin" ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter("admin")}
            >
              Admins
            </Button>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.role === "ADMIN" ? (
                        <Shield className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Joined {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {user._count?.files || 0} files
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user._count?.messages || 0} messages
                    </div>
                  </div>
                  
                  <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"}>
                    {user.role}
                  </Badge>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
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
          {users?.pagination && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {users.pagination.offset + 1} to{" "}
                {Math.min(users.pagination.offset + users.pagination.limit, users.pagination.total)} of{" "}
                {users.pagination.total} users
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={users.pagination.offset === 0}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!users.pagination.hasMore}>
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
