import { supabase } from "../lib/supabase.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  const token = authHeader.split(" ")[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: "Invalid token." });
  }

  const { website_id, fileType } = req.query;
  if (!website_id) {
    return res.status(400).json({ error: "website_id query param is required." });
  }

  const busboy = (await import("busboy")).default;
  const bb = busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });

  let fileBuffer = null;
  let fileName = "";
  let fileMime = "";

  bb.on("file", (fieldname, file, info) => {
    const { filename, mimeType } = info;
    fileName = filename;
    fileMime = mimeType;

    const chunks = [];
    file.on("data", (chunk) => chunks.push(chunk));
    file.on("end", () => {
      fileBuffer = Buffer.concat(chunks);
    });
  });

  bb.on("finish", async () => {
    if (!fileBuffer) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const storagePath = `${user.id}/${website_id}/${Date.now()}_${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("website-assets")
      .upload(storagePath, fileBuffer, {
        contentType: fileMime,
        cacheControl: "3600",
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("website-assets")
      .getPublicUrl(storagePath);

    const { data: asset, error: dbError } = await supabase
      .from("assets")
      .insert([{
        website_id,
        user_id: user.id,
        file_name: fileName,
        file_type: fileMime,
        file_size: fileBuffer.length,
        storage_path: storagePath,
        public_url: publicUrl,
      }])
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    return res.status(200).json({ asset });
  });

  req.pipe(bb);
}
