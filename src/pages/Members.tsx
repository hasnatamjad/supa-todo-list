import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Members() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("app_users")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (data) setUsers(data);
    }

    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Members</h2>

      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </div>
  );
}
