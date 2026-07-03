import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  const { error } = await supabase.from("contacts").insert([{
    name,
    email,
    phone: phone || null,
    service: service || null,
    message,
  }]);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Failed to save message." });
  }

  return res.status(200).json({ success: true, message: "Message received!" });
}
