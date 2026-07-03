import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

let supabase = null;
try {
  const mod = await import("./lib/supabase.js");
  supabase = mod.supabase;
} catch {
  console.log("Supabase not configured — contact form will log locally.");
}

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  if (supabase) {
    const { error } = await supabase.from("contacts").insert([{
      name, email, phone: phone || null, service: service || null, message,
    }]);
    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to save message." });
    }
  } else {
    const entry = { name, email, phone, service, message, timestamp: new Date().toISOString() };
    const logFile = join(__dirname, "contact-submissions.json");
    const logs = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf8")) : [];
    logs.push(entry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    console.log("Contact form submission saved locally:", entry.name);
  }

  return res.status(200).json({ success: true, message: "Message received!" });
});

app.listen(PORT, () => {
  console.log(`NVM Protection running at http://localhost:${PORT}`);
});
