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

      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
