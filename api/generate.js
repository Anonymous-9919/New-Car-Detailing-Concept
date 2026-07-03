import { GoogleGenAI } from "@google/genai";
import { supabase } from "../lib/supabase.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ error: "A valid prompt is required." });
  }

  let user = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const { data } = await supabase.auth.getUser(token);
    user = data?.user || null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const result = { text: response.text };

    if (user) {
      await supabase.from("generations").insert([{
        user_id: user.id,
        prompt,
        response: response.text,
      }]).maybeSingle();
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ 
      error: "Error communicating with Gemini API.",
      details: error.message || error
    });
  }
}
