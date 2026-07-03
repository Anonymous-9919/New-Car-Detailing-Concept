import { supabase } from "../../lib/supabase.js";

function getToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.split(" ")[1];
}

export default async function handler(req, res) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: "Invalid token." });
  }

  switch (req.method) {
    case "GET": {
      const { data, error } = await supabase
        .from("websites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ websites: data });
    }

    case "POST": {
      const { title, slug, description, template } = req.body;
      if (!title || !slug) {
        return res.status(400).json({ error: "Title and slug are required." });
      }

      const { data, error } = await supabase
        .from("websites")
        .insert([{ user_id: user.id, title, slug, description, template: template || "blank" }])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return res.status(409).json({ error: "Slug already exists." });
        }
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ website: data });
    }

    default: {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  }
}
