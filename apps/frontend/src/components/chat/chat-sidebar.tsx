"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  MessageSquare, 
  MoreHorizontal, 
  Trash2, 
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface ChatSidebarProps {
  currentChatId?: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat?: (chatId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChatSidebar({ 
  currentChatId, 
  onChatSelect, 
  onNewChat,
  onDeleteChat,
  isCollapsed = false,
  onToggleCollapse 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Getting Started",
      lastMessage: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      messageCount: 3
    },
    {
      id: "2", 
      title: "Project Discussion",
      lastMessage: "Let me help you analyze that document...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messageCount: 12
    },
    {
      id: "3",
      title: "Code Review",
      lastMessage: "The implementation looks good overall...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messageCount: 8
    }
  ]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredChats = chatSessions.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn(
      "flex h-full flex-col border-r border-border/30 bg-muted/30 transition-all duration-300",
      isCollapsed ? "w-14" : "w-80"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b border-border/30",
        isCollapsed ? "p-2" : "p-4 space-y-3"
      )}>
        {isCollapsed ? (
          // Collapsed header - just toggle button
          <div className="flex justify-center">
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="flat-button w-12 h-10 p-0 hover:bg-accent"
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          // Expanded header
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Chats</h2>
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className="flat-button"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* New Chat Button & Search - Only in expanded mode */}
            <Button
              onClick={onNewChat}
              className="w-full flat-button justify-start"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}
        
        {/* New Chat Button for collapsed mode */}
        {isCollapsed && (
          <div className="px-1 pb-2">
            <div className="flex justify-center">
              <Button
                onClick={onNewChat}
                variant="ghost"
                size="sm"
                className="w-12 h-9 p-0 flat-button hover:bg-accent rounded-lg"
                title="New Chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn(
          isCollapsed ? "py-2 px-1 space-y-1 flex flex-col items-center" : "p-2 space-y-1"
        )}>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={cn(
                "group relative cursor-pointer transition-colors",
                isCollapsed 
                  ? "flex items-center justify-center rounded-lg my-0.5 h-10 w-12 hover:bg-accent/70"
                  : "flex items-start gap-3 rounded-lg p-3 hover:bg-accent/50",
                currentChatId === chat.id 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={isCollapsed ? chat.title : undefined}
            >
              <MessageSquare className={cn(
                "shrink-0",
                isCollapsed ? "h-4 w-4" : "h-4 w-4 mt-0.5",
                currentChatId === chat.id ? "text-primary" : "text-muted-foreground"
              )} />
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">
                      {chat.title}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatTimestamp(chat.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {chat.messageCount} messages
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat?.(chat.id);
                        }}
                        title="Delete chat"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle more options (rename, export, etc.)
                        }}
                        title="More options"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Only show in expanded mode */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border/30">
          <div className="text-xs text-muted-foreground text-center">
            HumanLenk AI Assistant
          </div>
        </div>
      )}
    </div>
  );
}
