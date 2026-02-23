import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function Members() {
  const [users, setUsers] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Init
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id || null);

      const { data } = await supabase.from("profiles").select("*");

      if (data) {
        setUsers(data.filter((u) => u.id !== user?.id));
      }
    }

    init();
  }, []);

  // 🔥 Realtime subscription
  useEffect(() => {
  if (!activeConversation) return;

  const channel = supabase
    .channel(`chat-${activeConversation}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${activeConversation}`,
      },
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [activeConversation]);

  async function handleChat(otherUserId: string) {
    if (!currentUserId) return;

    const sortedUsers = [currentUserId, otherUserId].sort();
    const user1 = sortedUsers[0];
    const user2 = sortedUsers[1];

    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("user1", user1)
      .eq("user2", user2)
      .maybeSingle();

    if (existing) {
      setActiveConversation(existing.id);

      const { data: oldMessages } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", existing.id)
        .order("created_at", { ascending: true });

      setMessages(oldMessages || []);
      return;
    }

    const { data: newConversation } = await supabase
      .from("conversations")
      .insert({ user1, user2 })
      .select()
      .single();

    if (newConversation) {
      setActiveConversation(newConversation.id);
      setMessages([]);
    }
  }

  async function handleSend() {
  if (!newMessage.trim() || !activeConversation || !currentUserId) return;

  await supabase
    .from("messages")
    .insert({
      conversation_id: activeConversation,
      sender_id: currentUserId,
      content: newMessage,
    });

  setNewMessage("");
}

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Chat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleChat(user.id)}>
                      Chat
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {activeConversation && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-background border rounded-xl shadow-xl flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="text-sm font-medium">Chat</span>
            <button
              className="text-xs text-muted-foreground"
              onClick={() => setActiveConversation(null)}
            >
              Close
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto text-sm space-y-2">
            {messages.length === 0 ? (
              <p className="text-muted-foreground">No messages yet.</p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                        isMe
                          ? "bg-blue-100 text-black"
                          : "bg-gray-100 text-black"
                      }`}
                    >
                      <div>{msg.content}</div>
                      <div className="text-[10px] text-gray-500 mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div className="border-t p-2 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-primary text-white px-3 rounded text-sm"
            >
              Send
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
