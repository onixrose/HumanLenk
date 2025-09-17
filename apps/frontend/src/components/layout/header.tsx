"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
// import { Badge } from "@/components/ui/badge";
import { LogOut, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  isAuthenticated: boolean;
  userRole?: string;
  onAuthClick: () => void;
  onLogout: () => void;
}

export function Header({ isAuthenticated, userRole, onAuthClick, onLogout }: HeaderProps) {
  const router = useRouter();
  return (
    <header className="flat-header">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            {/* Modern H Logo */}
            <div className="relative h-10 w-10 flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105"></div>
              <div className="relative flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M4 4v16M20 4v16M4 12h16"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight">HumanLenk</h1>
              <p className="text-xs text-muted-foreground -mt-1">AI Assistant</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {userRole === "ADMIN" ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              {userRole === "ADMIN" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push("/admin")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={onAuthClick}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
}
