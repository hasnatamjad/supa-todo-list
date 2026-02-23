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
        <div className="fixed bottom-4 right-4 bg-white border shadow-lg p-4 rounded-md">
          <p className="text-sm">Conversation ID:</p>
          <p className="text-xs break-all">{activeConversation}</p>
        </div>
      )}
    </div>
  );
}
