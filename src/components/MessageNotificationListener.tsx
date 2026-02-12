import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { createElement } from "react";

const MessageNotificationListener = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const convoIdsRef = useRef<Set<string>>(new Set());
  const profileCacheRef = useRef<Map<string, string>>(new Map());
  const subscribedRef = useRef(false);

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  // Fetch conversation IDs once user is available
  useEffect(() => {
    if (!user || loading) return;

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
  }, [user?.id, loading]);

  // Subscribe to realtime — stable effect, only depends on user ID
  useEffect(() => {
    if (!user || loading) return;
    if (subscribedRef.current) return;

    subscribedRef.current = true;

    const channel = supabase
      .channel(`msg-notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as { id: string; conversation_id: string; sender_id: string; content: string };

          if (msg.sender_id === userIdRef.current) return;
          if (!convoIdsRef.current.has(msg.conversation_id)) return;

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
              onClick: () => navigateRef.current(`/chat?dm=${msg.conversation_id}`),
            },
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      subscribedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id, loading]);

  return null;
};

export default MessageNotificationListener;
