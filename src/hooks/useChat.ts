import { useState, useEffect, useCallback, useMemo } from "react";
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
  unreadCount: number;
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

    // Fetch conversations + my membership (for last_read_at)
    const { data: myMemberships } = await supabase
      .from("conversation_members")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);

    if (!myMemberships || myMemberships.length === 0) { setLoading(false); return; }

    const convoIds = myMemberships.map((m) => m.conversation_id);
    const lastReadMap = new Map(myMemberships.map((m) => [m.conversation_id, m.last_read_at]));

    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convoIds)
      .order("created_at", { ascending: false });

    if (!convos) { setLoading(false); return; }

    // Batch: get all other DM members
    const dmConvoIds = convos.filter((c) => c.type === "dm").map((c) => c.id);
    let otherUserMap = new Map<string, { display_name: string; avatar_url: string | null }>();

    if (dmConvoIds.length > 0) {
      const { data: allMembers } = await supabase
        .from("conversation_members")
        .select("conversation_id, user_id")
        .in("conversation_id", dmConvoIds)
        .neq("user_id", user.id);

      if (allMembers && allMembers.length > 0) {
        const otherUserIds = [...new Set(allMembers.map((m) => m.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", otherUserIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
        for (const m of allMembers) {
          const profile = profileMap.get(m.user_id);
          if (profile) otherUserMap.set(m.conversation_id, { display_name: profile.display_name, avatar_url: profile.avatar_url });
        }
      }
    }

    // Batch: get last message + unread count for each convo
    const enriched: Conversation[] = [];
    for (const c of convos) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastReadAt = lastReadMap.get(c.id) || c.created_at;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .gt("created_at", lastReadAt)
        .neq("sender_id", user.id);

      enriched.push({
        ...c,
        type: c.type as "group" | "dm",
        lastMessage: msgs?.[0]?.content,
        lastMessageAt: msgs?.[0]?.created_at,
        unreadCount: count || 0,
        otherUser: otherUserMap.get(c.id),
      });
    }

    enriched.sort((a, b) => {
      const aTime = a.lastMessageAt || a.created_at;
      const bTime = b.lastMessageAt || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    setConversations(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const totalUnread = useMemo(() => conversations.reduce((sum, c) => sum + c.unreadCount, 0), [conversations]);

  return { conversations, loading, refetch: fetchConversations, totalUnread };
}

export function useUnreadCount() {
  const { user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { data: memberships } = await supabase
        .from("conversation_members")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);

      if (!memberships || memberships.length === 0) { setTotalUnread(0); return; }

      let total = 0;
      for (const m of memberships) {
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", m.conversation_id)
          .gt("created_at", m.last_read_at)
          .neq("sender_id", user.id);
        total += count || 0;
      }
      setTotalUnread(total);
    };

    fetchUnread();

    // Listen for new messages globally
    const channel = supabase
      .channel("unread-global")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return totalUnread;
}

export async function markConversationRead(conversationId: string, userId: string) {
  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
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

export async function findOrCreateDM(currentUserId: string, targetUserId: string, leagueId: string): Promise<string | null> {
  const { data: myConvos } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", currentUserId);

  if (myConvos && myConvos.length > 0) {
    const convoIds = myConvos.map((c) => c.conversation_id);

    const { data: dmConvos } = await supabase
      .from("conversations")
      .select("id")
      .in("id", convoIds)
      .eq("type", "dm")
      .eq("league_id", leagueId);

    if (dmConvos) {
      for (const convo of dmConvos) {
        const { data: targetMember } = await supabase
          .from("conversation_members")
          .select("id")
          .eq("conversation_id", convo.id)
          .eq("user_id", targetUserId)
          .maybeSingle();

        if (targetMember) return convo.id;
      }
    }
  }

  const newId = crypto.randomUUID();
  const { error: convoError } = await supabase
    .from("conversations")
    .insert({ id: newId, league_id: leagueId, type: "dm", name: null });

  if (convoError) return null;

  await supabase.from("conversation_members").insert({ conversation_id: newId, user_id: currentUserId });
  await supabase.from("conversation_members").insert({ conversation_id: newId, user_id: targetUserId });

  return newId;
}
