"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { AuthModal } from "@/components/auth/auth-modal";
import { FileUploadSection } from "@/components/files/file-upload-section";
import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useAuth } from "@humanlenk/api-client";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  return (
    <div className="flex h-screen flex-col">
      <Header 
        isAuthenticated={isAuthenticated}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={() => setIsAuthenticated(false)}
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
            
            <TabsContent value="chat" className="flex-1 overflow-hidden">
              <ChatInterface />
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
