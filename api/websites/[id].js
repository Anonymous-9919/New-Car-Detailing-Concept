import { supabase } from "../../lib/supabase.js";

function getToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.split(" ")[1];
}

export default async function handler(req, res) {
  const { id } = req.query;
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
        .select("*, pages(*), site_settings(*)")
        .eq("id", id)
        .single();

      if (error) return res.status(404).json({ error: "Website not found." });
      if (data.user_id !== user.id && !data.published) {
        return res.status(403).json({ error: "Access denied." });
      }

      return res.status(200).json({ website: data });
    }

    case "PATCH": {
      const { title, slug, description, published, custom_domain } = req.body;

      const { data: existing } = await supabase
        .from("websites")
        .select("user_id")
        .eq("id", id)
        .single();

      if (!existing) return res.status(404).json({ error: "Website not found." });
      if (existing.user_id !== user.id) return res.status(403).json({ error: "Access denied." });

      const { data, error } = await supabase
        .from("websites")
        .update({ title, slug, description, published, custom_domain, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ website: data });
    }

    case "DELETE": {
      const { data: existing } = await supabase
        .from("websites")
        .select("user_id")
        .eq("id", id)
        .single();

      if (!existing) return res.status(404).json({ error: "Website not found." });
      if (existing.user_id !== user.id) return res.status(403).json({ error: "Access denied." });

      const { error } = await supabase.from("websites").delete().eq("id", id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ message: "Website deleted." });
    }

    default: {
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  }
}
