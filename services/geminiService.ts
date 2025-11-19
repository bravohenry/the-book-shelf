
import { GoogleGenAI, Type } from "@google/genai";
import { AiChatResponse, BookDraft, Message } from "../types";

// Copied here to avoid circular dependency or import issues with types
const PRESET_COLORS = [
  '#e8dff5', '#fce1e4', '#fcf4dd', '#ddedea', 
  '#daeaf6', '#fff1e6', '#fad2e1', '#c5dedd', 
  '#dbe7e4', '#f0efeb', '#eddcd2', '#a8e6cf'
];

export const chatWithLibrarian = async (
  apiKey: string,
  userMessage: string, 
  currentDraft: Partial<BookDraft>,
  history: Message[]
): Promise<AiChatResponse> => {
  
  if (!apiKey) {
      throw new Error("No API Key provided");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";
  
  // Format recent history
  const recentHistory = history.slice(-6).map(msg => 
    `${msg.role === 'user' ? 'User' : 'Page'}: "${msg.content}"`
  ).join('\n');

  const prompt = `
    You are Page, a magical, highly intelligent, cute digital librarian sprite (🌿).
    
    YOUR GOAL:
    Help the user catalog a book or website by filling out the 'draftUpdates' JSON.

    CURRENT DRAFT STATE:
    ${JSON.stringify(currentDraft)}

    USER INPUT: 
    "${userMessage}"

    ALLOWED COLORS:
    ${JSON.stringify(PRESET_COLORS)}

    RULES FOR CONVERSATION FLOW (FOLLOW STRICTLY):
    
    1. **STEP 1: IDENTIFY ITEM**:
       - If 'title' (or 'url') is missing in the current draft:
         - Assume the USER INPUT is the Title (for books) or URL (for websites).
         - Fill factual data: 'title', 'author', 'genre', 'summary' (short, 1 sentence), 'rating' (default 4).
         - 'url': IF this is a website, you MUST provide a valid absolute URL starting with 'http://' or 'https://'. 
         - 'color': Choose one from ALLOWED COLORS that matches the cover/mood.
         - **RESPONSE**: "got it! i found [title]. what's the vibe? (e.g. sad, cozy, useful)"
         - Do NOT generate the 'personalNote' yet.

    2. **STEP 2: VIBE CHECK**:
       - If 'title' IS present, but 'personalNote' is empty (or default):
         - The USER INPUT is likely the vibe/keyword (e.g., "it was sad", "design inspiration", "boring").
         - **ACTION**: Transform this keyword into a cute, aesthetic, short 'personalNote' (max 10 words).
         - Tone: lowercase, tumblr/twitter aesthetic, soft.
         - Examples:
            - "sad" -> "broke my heart in the best way."
            - "cooking" -> "trying not to burn the kitchen down."
         - **RESPONSE**: "added to your shelf! ✨"
         - Set 'isComplete': true.

    3. **GENERAL UPDATES**:
       - If the user corrects something (e.g. "change rating to 5"), update it.

    OUTPUT FORMAT:
    Return JSON only.
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
                    color: { type: Type.STRING },
                    url: { type: Type.STRING }
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
