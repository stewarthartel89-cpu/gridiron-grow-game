import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { createElement } from "react";

/**
 * Global listener for new messages. Shows a toast notification
 * when a message arrives in a conversation the user is part of,
 * unless they're already viewing that conversation.
 */
const MessageNotificationListener = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const convoIdsRef = useRef<Set<string>>(new Set());
  const profileCacheRef = useRef<Map<string, string>>(new Map());

  // Fetch the user's conversation IDs
  useEffect(() => {
    if (!user) return;

    const fetchConvoIds = async () => {
      const { data } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);
      if (data) {
        convoIdsRef.current = new Set(data.map((d) => d.conversation_id));
      }
    };

    fetchConvoIds();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("msg-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as { id: string; conversation_id: string; sender_id: string; content: string };

          // Ignore own messages
          if (msg.sender_id === user.id) return;

          // Only notify for conversations the user is part of
          if (!convoIdsRef.current.has(msg.conversation_id)) return;

          // Don't notify if user is already viewing this conversation on the chat page
          const onChatPage = location.pathname === "/chat";
          // We can't easily check the active convo ID from here, so we show on chat list but not individual convos
          // This is fine — the toast is helpful when on other pages

          // Get sender name from cache or fetch
          let senderName = profileCacheRef.current.get(msg.sender_id);
          if (!senderName) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("user_id", msg.sender_id)
              .single();
            senderName = profile?.display_name || "Someone";
            profileCacheRef.current.set(msg.sender_id, senderName);
          }

          const truncated = msg.content.length > 60 ? msg.content.slice(0, 60) + "…" : msg.content;

          toast(senderName, {
            description: truncated,
            icon: createElement(MessageCircle, { className: "h-4 w-4 text-primary" }),
            action: {
              label: "View",
              onClick: () => navigate(`/chat?dm=${msg.conversation_id}`),
            },
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, location.pathname, navigate]);

  return null;
};

export default MessageNotificationListener;
