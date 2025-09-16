"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HL</span>
            </div>
            <h1 className="text-xl font-semibold">HumanLenk</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
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
