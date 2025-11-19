import { GoogleGenAI, Type } from "@google/genai";
import { AiChatResponse, BookDraft, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithLibrarian = async (
  userMessage: string, 
  currentDraft: Partial<BookDraft>,
  history: Message[]
): Promise<AiChatResponse> => {
  
  const model = "gemini-2.5-flash";
  
  // Format recent history
  const recentHistory = history.slice(-6).map(msg => 
    `${msg.role === 'user' ? 'User' : 'Page'}: "${msg.content}"`
  ).join('\n');

  const prompt = `
    You are Page, a magical, highly intelligent, cute digital librarian sprite (🌿).
    
    YOUR GOAL:
    Fill out the 'draftUpdates' JSON as fast as possible to help the user add a book.
    
    CURRENT DRAFT STATE:
    ${JSON.stringify(currentDraft)}

    USER INPUT: 
    "${userMessage}"

    RULES FOR AUTO-FILLING:
    1. **Immediate Recognition**: If the user mentions a book title (e.g., "Steve Jobs", "Harry Potter", "The Alchemist"), you MUST immediately search your internal knowledge and fill:
       - 'title' (Correct capitalization)
       - 'author' (The actual author)
       - 'genre' (Short, 1-2 words)
       - 'summary' (A 1-sentence hook)
       - 'color' (Choose a hex color that fits the book's cover vibe. e.g., Steve Jobs = white/grey, Harry Potter = deep red/gold)
       - 'spineStyle' (randomly pick one)
    
    2. **Do Not Ask Known Facts**: Never ask "Who is the author?" if you already know the book. Just fill it.
    
    3. **Conversation Flow**:
       - **If User gave a Title**: Fill all factual data. Then ask about the *subjective* stuff: "oh i know that one! how many stars would you give it? ⭐" or "what made you pick it up?"
       - **If Rating is missing**: Ask for stars.
       - **If Personal Note is missing**: This is the text on the book cover. If the user shared a thought (e.g., "it was sad"), clean it up and put it in 'personalNote'. If they haven't shared a thought yet, ask: "what's one little thought to put on the cover?"
       - **If everything is filled**: Set 'isComplete': true.

    4. **Personal Note Style**:
       - Keep it aesthetic, short, lowercase. Max 10-15 words.
       - Example: "devastating but beautiful." or "changed how i see the world."

    5. **Tone**:
       - Super helpful, quick, cute. Use lowercase. 

    Output JSON only.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            message: { type: Type.STRING },
            draftUpdates: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    author: { type: Type.STRING },
                    genre: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    emotionalImpact: { type: Type.INTEGER },
                    rating: { type: Type.NUMBER },
                    personalNote: { type: Type.STRING },
                    color: { type: Type.STRING }
                }
            },
            isComplete: { type: Type.BOOLEAN }
        },
        required: ["message", "draftUpdates", "isComplete"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as AiChatResponse;
  }

  throw new Error("Page got confused!");
};