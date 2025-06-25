import { supabase } from "../../lib/supabase";
import type { Request, Response } from "express";
import { createClient } from "../../lib/supabase"

export async function getChats(req: Request, res: Response) {
  try {
    const { user_id } = req.query;
    console.log("[GET /api/chats] user_id:", user_id);
    
    if (!user_id) {
      console.log("[GET /api/chats] Missing user_id");
      return res.status(400).json({ error: "user_id is required" });
    }

    const { data: chats, error } = await supabase
      .from("chats")
      .select("*")
      .eq("profile_id", user_id)
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (error) {
      console.error("[GET /api/chats] Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch chats", chats: [] });
    }
    console.log("[GET /api/chats] Returning chats:", chats);
    res.json({ chats: chats || [] });
  } catch (error) {
    console.error("[GET /api/chats] Database error:", error);
    res.status(500).json({ error: "Failed to fetch chats", chats: [] });
  }
}

export async function postChat(req: Request, res: Response) {
  try {
    const { chatId, title, userId } = req.body;
    console.log("[POST /api/chats] body:", req.body);
    
    if (!userId) {
      console.log("[POST /api/chats] Missing userId");
      return res.status(400).json({ error: "userId is required" });
    }

    const { data, error } = await supabase.from("chats").insert({
      id: chatId,
      profile_id: userId,
      title: title || "New Chat",
      created_at: new Date().toISOString(),
    }).select();

    if (error) {
      console.error("[POST /api/chats] Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save chat" });
    }
    console.log("[POST /api/chats] Inserted chat:", data?.[0]);
    res.json({ success: true, chat: data?.[0] });
  } catch (error) {
    console.error("[POST /api/chats] Database error:", error);
    res.status(500).json({ error: "Failed to save chat" });
  }
}

export async function patchChat(req: Request, res: Response) {
  const supabase = createClient()
  const { chatId, title } = req.body

  if (!chatId || !title) {
    return res.status(400).json({ error: "chatId and title are required" })
  }

  const { data, error } = await supabase
    .from("chats")
    .update({ title })
    .eq("id", chatId)
    .select()

  if (error) {
    console.error("Error updating chat title:", error)
    return res.status(500).json({ error: "Failed to update chat title" })
  }

  return res
    .status(200)
    .json({ message: "Chat title updated successfully", chat: data[0] })
}

export async function deleteChat(req: Request, res: Response) {
  const supabase = createClient()
  const { chatId } = req.params

  if (!chatId) {
    return res.status(400).json({ error: "chatId is required" })
  }

  const { error } = await supabase.from("chats").delete().eq("id", chatId)

  if (error) {
    console.error("Error deleting chat:", error)
    return res.status(500).json({ error: "Failed to delete chat" })
  }

  return res.status(200).json({ message: "Chat deleted successfully" })
}

export async function deleteAllChatsPost(req: Request, res: Response) {
  const supabase = createClient();
  const { user_id } = req.body;

  console.log("[POST /api/chats/delete-all] Start with user_id:", user_id);

  if (!user_id) {
    console.log("[POST /api/chats/delete-all] Missing user_id");
    return res.status(400).json({ error: "user_id is required" });
  }

  // Step 1: Fetch chats
  const { data: chats, error: chatsError } = await supabase
    .from("chats")
    .select("id")
    .eq("profile_id", user_id);

  console.log("[POST /api/chats/delete-all] Chats:", chats);
  if (chatsError) {
    console.error("Error fetching chats:", chatsError);
    return res.status(500).json({ error: "Failed to fetch chats" });
  }

  const chatIds = chats?.map(chat => chat.id) || [];
  console.log("[POST /api/chats/delete-all] Chat IDs:", chatIds);

  // Step 2: Delete messages
  if (chatIds.length > 0) {
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .in("chat_id", chatIds);

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      return res.status(500).json({ error: "Failed to delete messages" });
    }

    console.log("[POST /api/chats/delete-all] Messages deleted");
  } else {
    console.log("[POST /api/chats/delete-all] No chats to delete messages from");
  }

  // Step 3: Delete chats
  const { error: chatsDeleteError } = await supabase
    .from("chats")
    .delete()
    .eq("profile_id", user_id);

  if (chatsDeleteError) {
    console.error("Error deleting chats:", chatsDeleteError);
    return res.status(500).json({ error: "Failed to delete chats" });
  }

  console.log("[POST /api/chats/delete-all] Chats deleted");

  return res.status(200).json({ message: "All chats and messages deleted" });
}


// export async function deleteAllChats(req: Request, res: Response) {
//   try {
//     const { user_id } = req.query;
    
//     if (!user_id) {
//       return res.status(400).json({ error: "user_id is required" });
//     }

//     const { error } = await supabase
//       .from("chats")
//       .delete()
//       .eq("user_id", user_id);
      
//     if (error) {
//       console.error("Supabase delete error:", error);
//       return res.status(500).json({ error: "Failed to clear chats" });
//     }
//     res.json({ success: true });
//   } catch (error) {
//     console.error("Database error:", error);
//     res.status(500).json({ error: "Failed to clear chats" });
//   }
// }
