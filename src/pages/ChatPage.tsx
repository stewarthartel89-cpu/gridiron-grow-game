import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Users, User } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useMessages, sendMessage, type Conversation } from "@/hooks/useChat";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const ConversationList = ({ conversations, loading, onSelect }: {
  conversations: Conversation[];
  loading: boolean;
  onSelect: (c: Conversation) => void;
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">No conversations yet</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Join a league to start chatting with other players
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((c) => {
        const isGroup = c.type === "group";
        const displayName = isGroup ? (c.name || "League Chat") : (c.otherUser?.display_name || "Player");

        return (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-accent/50 transition-colors"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isGroup ? "bg-primary/15" : "bg-secondary"}`}>
              {isGroup ? (
                <Users className="h-5 w-5 text-primary" />
              ) : c.otherUser?.avatar_url ? (
                <img src={c.otherUser.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground truncate">{displayName}</span>
                {c.lastMessageAt && (
                  <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{timeAgo(c.lastMessageAt)}</span>
                )}
              </div>
              {c.lastMessage && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const MessageView = ({ conversation, onBack }: { conversation: Conversation; onBack: () => void }) => {
  const { user } = useAuth();
  const { messages, loading } = useMessages(conversation.id);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isGroup = conversation.type === "group";
  const title = isGroup ? (conversation.name || "League Chat") : (conversation.otherUser?.display_name || "Player");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || sending) return;
    setSending(true);
    await sendMessage(conversation.id, user.id, input);
    setInput("");
    setSending(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card safe-area-top shrink-0">
        <div className="mx-auto max-w-2xl px-2 py-3 flex items-center gap-2">
          <button onClick={onBack} className="rounded-lg p-2 text-primary active:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isGroup ? "bg-primary/15" : "bg-secondary"}`}>
            {isGroup ? <Users className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
          </div>
          <h1 className="font-display text-base font-bold text-foreground truncate">{title}</h1>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isMe ? "order-1" : ""}`}>
                  {isGroup && !isMe && (
                    <p className="text-[10px] text-muted-foreground font-semibold mb-0.5 ml-3">
                      {msg.sender?.display_name}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[9px] text-muted-foreground mt-0.5 ${isMe ? "text-right mr-1" : "ml-1"}`}>
                    {timeAgo(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-2 safe-area-bottom shrink-0">
        <div className="mx-auto max-w-2xl flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message..."
            className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { conversations, loading } = useConversations();
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);

  if (activeConvo) {
    return <MessageView conversation={activeConvo} onBack={() => setActiveConvo(null)} />;
  }

  return (
    <PageTransition>
      <div className="min-h-[100dvh] bg-background">
        <header className="border-b border-border bg-card safe-area-top">
          <div className="mx-auto max-w-2xl px-2 py-3 flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-primary active:bg-accent transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">Messages</h1>
          </div>
        </header>

        <ConversationList conversations={conversations} loading={loading} onSelect={setActiveConvo} />
      </div>
    </PageTransition>
  );
};

export default ChatPage;
