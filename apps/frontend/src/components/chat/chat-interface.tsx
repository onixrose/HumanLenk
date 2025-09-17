"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Mic, Paperclip, MicOff, FileText, Lightbulb, List } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useChat } from "@humanlenk/api-client";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatInterfaceProps {
  token?: string;
}

export function ChatInterface({ token }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = input;
    setInput("");
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: messageContent,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const assistantMessage: Message = {
          id: data.data.assistantMessage.id,
          content: data.data.assistantMessage.content,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // TODO: Implement actual voice recording stop and transcription
      console.log("Voice recording stopped");
    } else {
      // Start recording
      setIsRecording(true);
      // TODO: Implement actual voice recording start
      console.log("Voice recording started");
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // TODO: Implement file upload
      console.log("File selected:", file.name);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSuggestedAction = (action: string) => {
    setInput(action);
    // Auto-send the suggested action
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  // Show suggested actions when there are multiple messages
  const showSuggestedActions = messages.length >= 3 && !isLoading;

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-3xl animate-slide-in-up",
              message.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            
            <div
              className={cn(
                "p-3 max-w-[80%] message-bubble",
                message.role === "user"
                  ? "user"
                  : "assistant"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 max-w-3xl animate-fade-in-scale">
            <Avatar className="h-8 w-8 shrink-0 animate-pulse-soft">
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="p-3 message-bubble assistant">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-typing-dots" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-typing-dots" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-typing-dots" style={{ animationDelay: '400ms' }}></div>
                </div>
                <span className="text-sm animate-pulse-soft">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions */}
      {showSuggestedActions && (
        <div className="border-t border-border/30 px-4 py-3 bg-muted/20 animate-slide-in-up">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Suggested Actions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedAction("Summarize our conversation so far")}
                className="flat-button text-xs h-8"
              >
                <FileText className="h-3 w-3 mr-1" />
                Summarize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedAction("Extract key points from our discussion")}
                className="flat-button text-xs h-8"
              >
                <List className="h-3 w-3 mr-1" />
                Key Points
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedAction("What are the next steps I should take?")}
                className="flat-button text-xs h-8"
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                Next Steps
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedAction("Explain this in simpler terms")}
                className="flat-button text-xs h-8"
              >
                <Bot className="h-3 w-3 mr-1" />
                Simplify
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/30 p-4 bg-background">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* File Preview */}
          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeSelectedFile}
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                ×
              </Button>
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-2 items-end">
            {/* File Input (Hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.md"
            />
            
            {/* File Attachment Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFileSelect}
              disabled={isLoading}
              className="flat-button shrink-0"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <Input
                placeholder={isRecording ? "Recording..." : "Type your message..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isRecording}
                className={cn(
                  "flat-input pr-12",
                  isRecording && "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                )}
              />
              
              {/* Voice Recording Button - Inside Input */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceToggle}
                disabled={isLoading}
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flat-button",
                  isRecording && "text-red-500 hover:text-red-600"
                )}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 animate-pulse" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Send Button */}
            <Button 
              onClick={handleSend} 
              disabled={(!input.trim() && !selectedFile) || isLoading}
              size="icon"
              className="flat-button shrink-0"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording... Click mic to stop</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
