import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

export default function Members() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from("profiles").select("*")

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (data) setUsers(data);
    }

    fetchUsers();
  }, []);

  return (
  <div>
    <h2>Members</h2>

    <table border={1} cellPadding={8}>
      <thead>
        <tr>
          <th>Email</th>
          <th>Chat</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>
              <button>Chat</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}
