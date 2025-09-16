"use client";

import { useState } from "react";
import { useAdminStats, useAdminUsers, useAdminFiles } from "@/components/admin/admin-hooks";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { UsersTable } from "@/components/admin/users-table";
import { FilesTable } from "@/components/admin/files-table";
import { SurveysTable } from "@/components/admin/surveys-table";
// import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: files, isLoading: filesLoading } = useAdminFiles();

  const isLoading = statsLoading || usersLoading || filesLoading;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview stats={stats} isLoading={statsLoading} />;
      case "users":
        return <UsersTable users={users} isLoading={usersLoading} />;
      case "files":
        return <FilesTable files={files} isLoading={filesLoading} />;
      case "surveys":
        return <SurveysTable />;
      default:
        return <DashboardOverview stats={stats} isLoading={statsLoading} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
