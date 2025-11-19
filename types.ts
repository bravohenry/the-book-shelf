
export interface Book {
  id: string;
  title: string;
  author: string;
  rating: number; // 1-5
  genre: string;
  summary: string;
  emotionalImpact: number; // 0-100
  personalNote: string;
  color: string; // Hex code or tailwind class
  spineStyle: 'simple' | 'classic' | 'modern' | 'pattern-dots' | 'pattern-lines';
  height: number; // visual height variation (percentage of shelf height)
  rotation: number; // slight tilt for organic feel
  position?: {
    shelfId: number;
    xOffset: number;
  }
}

export interface BookDraft {
  title: string;
  author: string;
  rating: number;
  genre: string;
  summary: string;
  emotionalImpact: number;
  personalNote: string;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

export interface AiChatResponse {
  message: string;
  draftUpdates: Partial<BookDraft>;
  isComplete: boolean;
}

export const PRESET_COLORS = [
  '#e8dff5', // Soft Lavender
  '#fce1e4', // Cotton Candy
  '#fcf4dd', // Lemon Chiffon
  '#ddedea', // Ice Water
  '#daeaf6', // Cloud Blue
  '#fff1e6', // Peaches
  '#fad2e1', // Piggy Pink
  '#c5dedd', // Seafoam
  '#dbe7e4', // Minty
  '#f0efeb', // Linen
  '#eddcd2', // Biscuit
  '#a8e6cf', // Magic Mint
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'A Little Life',
    author: 'Hanya Yanagihara',
    rating: 5,
    genre: 'Literary Fiction',
    summary: "This book is enormous in emotional scale, almost operatic. It explores trauma with an intensity that is hard to absorb yet impossible to avoid.",
    emotionalImpact: 98,
    personalNote: "Needed to know if it was as intense as ppl say.",
    color: '#fad2e1',
    spineStyle: 'classic',
    height: 94,
    rotation: -1.5,
    position: { shelfId: 0, xOffset: 60 }
  },
  {
    id: '2',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    rating: 4,
    genre: 'Non-fiction',
    summary: "A brief history of humankind, exploring how biology and history have defined us.",
    emotionalImpact: 40,
    personalNote: "Changed how I view history.",
    color: '#daeaf6',
    spineStyle: 'modern',
    height: 88,
    rotation: 1,
    position: { shelfId: 0, xOffset: 140 }
  },
  {
    id: '3',
    title: 'Normal People',
    author: 'Sally Rooney',
    rating: 4,
    genre: 'Romance',
    summary: "A story of mutual fascination between two people who can't stay apart.",
    emotionalImpact: 70,
    personalNote: "Frustrating but beautiful.",
    color: '#ddedea',
    spineStyle: 'simple',
    height: 85,
    rotation: 0,
    position: { shelfId: 0, xOffset: 220 }
  },
  {
    id: '4',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    rating: 5,
    genre: 'Biography',
    summary: "The exclusive biography of Steve Jobs.",
    emotionalImpact: 60,
    personalNote: "Inspiring and terrifying.",
    color: '#f0efeb',
    spineStyle: 'pattern-lines',
    height: 98,
    rotation: 2,
    position: { shelfId: 0, xOffset: 300 }
  }
];
