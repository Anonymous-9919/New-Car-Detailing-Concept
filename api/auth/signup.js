import { supabase } from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
    },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({
    user: data.user,
    session: data.session,
    message: "Check your email for confirmation link.",
  });
}
