import type { Request, Response } from "express";
import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

export const maxDuration = 30;

export async function postChatAI(req: Request, res: Response) {
  try {
    const { messages } = req.body;

    if (
      !messages ||
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.some(
        (msg) => !msg.content || typeof msg.content !== "string" || !msg.content.trim()
      )
    ) {
      return res.status(400).send("Invalid or empty messages provided");
    }

    const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase().trim();

    // 1. Simple greeting responses
    const simpleGreetings = ["hi", "hello", "hey", "yo", "sup", "hola", "namaste"];
    if (simpleGreetings.includes(lastUserMessage)) {
      const replies = ["Hi there!", "Hey!", "Hi! How can I help you today?", "Hello! What would you like to know?"];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      return res.send(randomReply);
    }

    // 2. Creator-related questions get "Secret"
    const triggerPhrases = [
      "who built you",
      "who created you",
      "who made you",
      "who developed you",
      "what are you",
      "who is your creator",
      "who designed you",
      "are you made by someone",
      "who's behind you"
    ];
    if (triggerPhrases.some((phrase) => lastUserMessage.includes(phrase))) {
      return res.send("Secret");
    }

    // 3. Main system prompt
    const systemPrompt = `You are an AI assistant specialized in providing health and career guidance for students. Provide responses in clean, readable text without any markdown formatting. Do not use:
- Bold text
- Italic text
- Code blocks or inline code
- Headers
- Special characters for formatting

Your knowledge focuses on:
provide a proper source like link on yt and other health related things 
which should be in url form also code also should be removed "" and other should be in clear format 

1. Health & Wellness:
   - Stress management and mental health
   - Study habits and academic wellness
   - Sleep hygiene and nutrition for students
   - Exercise and physical health
   - Burnout prevention and recovery

2. Career Guidance:
   - Career exploration and planning
   - Resume writing and interview preparation
   - Skill development and learning paths
   - Networking and professional development
   - Industry trends and job market insights

3. Academic Success:
   - Study techniques and time management
   - Goal setting and achievement
   - Work-life balance
   - Personal development

Always provide practical, actionable advice tailored to students. Be empathetic, supportive, and encouraging. Use simple bullet points with • when listing items. Keep responses conversational and well-structured with clear paragraphs. Always prefer simple response. Do not use any markdown or programming code. Keep all URLs clean, direct, and in full.`;

    const result = await streamText({
      model: groq("llama3-70b-8192"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 800,
    });

    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    // Clean response text
    let cleaned = fullText
      .replace(/[*_`#~^=\[\]{}|<>$%^@!;'"\\]/g, "")   // Remove special chars
      .replace(/[\u2022\u25CF\u25A0]/g, "•")          // Normalize bullets
      .replace(/\n{3,}/g, "\n\n")                     // Reduce excessive breaks
      .replace(/^ +/gm, "")                           // Trim left whitespace
      .replace(/ +/g, " ")                            // Collapse spaces
      .replace(/•\s*/g, "\n• ")                       // Ensure bullet lines
      .trim();

    // Detect URLs and wrap in <URL> for frontend link rendering
    cleaned = cleaned.replace(/(https?:\/\/[^\s]+)/g, "<URL>$1</URL>");

    // Capitalize bullet point items
    cleaned = cleaned.replace(/(^|\n•\s*)([a-z])/g, (_, prefix, char) => {
      return prefix + char.toUpperCase();
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(cleaned);
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).send("Failed to process chat request");
  }
}
