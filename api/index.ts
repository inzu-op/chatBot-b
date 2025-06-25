import express from "express";
import {
  getChats, postChat, patchChat, deleteChat, deleteAllChatsPost
} from "./chats/route";
import { getMessages, postMessage } from "./messages/route";
import { postChatAI } from "./chat/route";
import authRouter from "./auth/route";

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);

app.get("/api/chats", getChats);
app.post("/api/chats", postChat);
app.patch("/api/chats", patchChat);
app.delete("/api/chats/:chatId", deleteChat);
// app.delete("/api/chats", deleteAllChatsForUser);
app.post("/api/chats", deleteAllChatsPost);

app.get("/api/messages", getMessages);
app.post("/api/messages", postMessage);
app.post("/api/chat", postChatAI);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

export default app;
