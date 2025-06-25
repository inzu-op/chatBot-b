export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
} 