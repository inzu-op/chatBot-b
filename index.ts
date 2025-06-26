// backend/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { postChat, getChats, deleteChat } from './api/chats/route';
import { postChatAI } from './api/chat/route';
import { getMessages, postMessage } from './api/messages/route';

const app = express();
const port = 3001;

// Middleware
app.use(cors({
    origin:[ 'http://localhost:3000',
    'https://assistant-f.vercel.app'] ,
    credentials: true,
}));
app.use(express.json());

// API Routes
app.get('/api/chats', getChats);       // Get all chats for user
app.post('/api/chats', postChat);      // Create a new chat
app.delete('/api/chats/:chatId', deleteChat); // Delete a chat by id
// app.delete('/api/chats', deleteAllChats); // Optional: Delete all chats for a user

app.post('/api/chat', postChatAI); 
// app.post('/api/chat/:id', postChatAI);    // AI response handler

app.get('/api/messages', getMessages); // Get messages by chat ID
app.post('/api/messages', postMessage); // Post message to chat

// Start server
app.listen(port, () => {
  console.log(`✅ Backend server listening at http://localhost:${port}`);
});
