"use client";

// Temporarily simplified admin page to fix build issues
export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <header className="border-b p-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </header>
        <main className="flex-1 p-6">
          <div className="text-center">
            <h2 className="text-lg text-muted-foreground">Admin features coming soon...</h2>
            <p className="text-sm text-muted-foreground mt-2">
              This page will include user management, analytics, and system controls.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}