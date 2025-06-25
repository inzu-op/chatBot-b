import { supabase } from "../../lib/supabase";
import type { Request, Response } from "express";

// GET /api/messages?chat_id=...
export async function getMessages(req: Request, res: Response) {
  const { chat_id } = req.query;
  if (!chat_id) {
    return res.status(400).json({ error: "chat_id is required" });
  }
  try {
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chat_id)
      .order("timestamp", { ascending: true });
    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch messages", messages: [] });
    }
    res.json({ messages: messages || [] });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch messages", messages: [] });
  }
}

// POST /api/messages
export async function postMessage(req: Request, res: Response) {
  const { chat_id, sender, content } = req.body;
  if (!chat_id || !sender || !content) {
    return res.status(400).json({ error: "chat_id, sender, and content are required" });
  }
  
  // Validate sender
  if (!['user', 'bot'].includes(sender)) {
    return res.status(400).json({ error: "sender must be 'user' or 'bot'" });
  }
  
  try {
    const { data, error } = await supabase.from("messages").insert([
      { 
        chat_id, 
        sender, 
        content,
        timestamp: new Date().toISOString()
      }
    ]).select();
    
    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save message" });
    }
    res.json({ success: true, message: data?.[0] });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
} 