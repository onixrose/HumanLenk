"use client";

import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { AuthModal } from "@/components/auth/auth-modal";
import { FileUploadSection } from "@/components/files/file-upload-section";
import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { useAuth } from "@humanlenk/api-client";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [_user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string>("1");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Check for existing auth on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser && storedUser !== "undefined") {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ Failed to parse stored user data:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Mobile detection and responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768; // md breakpoint
      setIsMobile(isMobileView);
      
      // Auto-collapse sidebar on mobile
      if (isMobileView) {
        setSidebarCollapsed(true);
        setMobileSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAuthSuccess = (authToken: string, authUser: any) => {
    setToken(authToken);
    setUser(authUser);
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
  };

  const handleDeleteChat = (chatId: string) => {
    // TODO: Implement actual chat deletion logic
    console.log("Deleting chat:", chatId);
    // If deleting current chat, switch to a different one
    if (chatId === currentChatId) {
      setCurrentChatId("1"); // Switch to first chat or create new one
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <Header 
        isAuthenticated={isAuthenticated}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 overflow-hidden">
        {isAuthenticated ? (
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
            </div>
            
              <TabsContent value="chat" className="flex-1 overflow-hidden flex relative">
              {/* Mobile Sidebar Overlay */}
              {isMobile && mobileSidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                />
              )}
              
              {/* Sidebar */}
              <div className={cn(
                "transition-all duration-300 z-50",
                isMobile 
                  ? cn(
                      "fixed left-0 top-16 bottom-0 bg-background border-r shadow-lg",
                      mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )
                  : "relative"
              )}>
                <ChatSidebar
                  currentChatId={currentChatId}
                  onChatSelect={handleChatSelect}
                  onNewChat={handleNewChat}
                  onDeleteChat={handleDeleteChat}
                  isCollapsed={isMobile ? false : sidebarCollapsed}
                  onToggleCollapse={() => {
                    if (isMobile) {
                      setMobileSidebarOpen(!mobileSidebarOpen);
                    } else {
                      setSidebarCollapsed(!sidebarCollapsed);
                    }
                  }}
                  isMobile={isMobile}
                  _mobileSidebarOpen={mobileSidebarOpen}
                  onMobileClose={() => setMobileSidebarOpen(false)}
                />
              </div>
              
              {/* Chat Interface */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Mobile Menu Button */}
                {isMobile && (
                  <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                      className="md:hidden"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="ml-2 text-sm">Chats</span>
                    </Button>
                    <div className="text-sm font-medium text-muted-foreground">
                      HumanLenk AI
                    </div>
                  </div>
                )}
                
                <div className="flex-1 overflow-hidden">
                  <ChatInterface token={token || undefined} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="files" className="flex-1 overflow-hidden p-4">
              <FileUploadSection />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 p-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  Welcome to HumanLenk
                </h1>
                <p className="text-xl text-muted-foreground">
                  AI-powered chat and intelligent file processing
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-2">Smart Chat</h3>
                    <p className="text-sm text-muted-foreground">
                      Engage with GPT-powered AI for summarizing, editing, and clarifying content
                    </p>
                  </div>
                  
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-2">File Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload PDF, DOCX, or TXT files for intelligent analysis and responses
                    </p>
                  </div>
                  
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-2">Premium Experience</h3>
                    <p className="text-sm text-muted-foreground">
                      Smooth, responsive interface designed for productivity
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal 
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
