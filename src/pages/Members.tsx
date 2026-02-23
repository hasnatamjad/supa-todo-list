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

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id || null);

      const { data } = await supabase
        .from("profiles")
        .select("*");

      if (data) {
        // remove current user from list
        setUsers(data.filter((u) => u.id !== user?.id));
      }
    }

    init();
  }, []);

  async function handleChat(otherUserId: string) {
    if (!currentUserId) return;

    // check if conversation already exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(user1.eq.${otherUserId},user2.eq.${currentUserId}),
         and(user1.eq.${currentUserId},user2.eq.${otherUserId})`
      )
      .maybeSingle();

    if (existing) {
      setActiveConversation(existing.id);
      return;
    }

    // create new conversation
    const { data: newConversation } = await supabase
      .from("conversations")
      .insert({
        user1: currentUserId,
        user2: otherUserId,
      })
      .select()
      .single();

    if (newConversation) {
      setActiveConversation(newConversation.id);
    }
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

    {/* Messages Area (empty for now) */}
    <div className="flex-1 p-3 overflow-y-auto text-sm text-muted-foreground">
      No messages yet.
    </div>

    {/* Input */}
    <div className="border-t p-2 flex gap-2">
      <input
        type="text"
        placeholder="Type a message..."
        className="flex-1 border rounded px-2 py-1 text-sm"
      />
      <button className="bg-primary text-white px-3 rounded text-sm">
        Send
      </button>
    </div>

  </div>
)}
    </div>
  );
}
