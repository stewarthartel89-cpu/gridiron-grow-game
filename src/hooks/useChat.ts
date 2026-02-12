import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Conversation {
  id: string;
  league_id: string | null;
  type: "group" | "dm";
  name: string | null;
  created_at: string;
  lastMessage?: string;
  lastMessageAt?: string;
  otherUser?: { display_name: string; avatar_url: string | null };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: { display_name: string; avatar_url: string | null };
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!convos) { setLoading(false); return; }

    // Get last message for each convo
    const enriched: Conversation[] = [];
    for (const c of convos) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1);

      let otherUser: Conversation["otherUser"] = undefined;
      if (c.type === "dm") {
        const { data: members } = await supabase
          .from("conversation_members")
          .select("user_id")
          .eq("conversation_id", c.id)
          .neq("user_id", user.id);

        if (members && members.length > 0) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", members[0].user_id)
            .single();
          if (profile) otherUser = profile;
        }
      }

      enriched.push({
        ...c,
        type: c.type as "group" | "dm",
        lastMessage: msgs?.[0]?.content,
        lastMessageAt: msgs?.[0]?.created_at,
        otherUser,
      });
    }

    // Sort by last message time
    enriched.sort((a, b) => {
      const aTime = a.lastMessageAt || a.created_at;
      const bTime = b.lastMessageAt || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    setConversations(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  return { conversations, loading, refetch: fetchConversations };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }

    const fetchMessages = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data) {
        // Enrich with sender profiles
        const senderIds = [...new Set(data.map((m) => m.sender_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", senderIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

        setMessages(
          data.map((m) => ({
            ...m,
            sender: profileMap.get(m.sender_id) || { display_name: "Unknown", avatar_url: null },
          }))
        );
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id, display_name, avatar_url")
            .eq("user_id", newMsg.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...newMsg, sender: profile || { display_name: "Unknown", avatar_url: null } },
          ]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  return { messages, loading };
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content: content.trim(),
  });
  return { error };
}
