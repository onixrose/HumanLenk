"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSurveys } from "./admin-hooks";
import { 
  Search, 
  Filter, 
  Star,
  MessageSquare,
  User
} from "lucide-react";

export function SurveysTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  
  const { data: surveys, isLoading } = useAdminSurveys();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Surveys & Feedback</CardTitle>
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

  const filteredSurveys = (surveys as any)?.surveys?.filter((survey: any) => {
    const matchesSearch = survey.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.feedback.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === "all" || survey.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Surveys & Feedback ({(surveys as any)?.pagination?.total || 0})
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
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
        
        {/* Average Rating */}
        {(surveys as any)?.averageRating && (
          <div className="flex items-center space-x-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Average Rating:</span>
              <div className="flex items-center space-x-1">
                {renderStars(Math.round((surveys as any).averageRating))}
                <span className={`text-lg font-bold ${getRatingColor(Math.round((surveys as any).averageRating))}`}>
                  {(surveys as any).averageRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Rating Filter */}
          <div className="flex space-x-2">
            <Button
              variant={ratingFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setRatingFilter("all")}
            >
              All
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={ratingFilter === rating.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => setRatingFilter(rating.toString())}
              >
                {rating} Star{rating > 1 ? "s" : ""}
              </Button>
            ))}
          </div>

          {/* Surveys List */}
          <div className="space-y-4">
            {filteredSurveys.map((survey: any) => (
              <div
                key={survey.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{survey.user?.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {survey.user?.email}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatDate(survey.createdAt)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center space-x-1">
                          {renderStars(survey.rating)}
                        </div>
                        <span className={`text-sm font-medium ${getRatingColor(survey.rating)}`}>
                          {survey.rating}/5
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <MessageSquare className="inline h-4 w-4 mr-1" />
                        {survey.feedback}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(surveys as any)?.pagination && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(surveys as any).pagination.offset + 1} to{" "}
                {Math.min((surveys as any).pagination.offset + (surveys as any).pagination.limit, (surveys as any).pagination.total)} of{" "}
                {(surveys as any).pagination.total} surveys
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={(surveys as any).pagination.offset === 0}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!(surveys as any).pagination.hasMore}>
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
