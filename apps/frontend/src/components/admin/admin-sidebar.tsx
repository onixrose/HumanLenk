"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart3,
  Shield
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
  },
  {
    id: "files",
    label: "Files",
    icon: FileText,
  },
  {
    id: "surveys",
    label: "Surveys",
    icon: MessageSquare,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
  },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <aside className="w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  activeTab === item.id && "bg-secondary"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            <p>HumanLenk Admin</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
