

export interface Book {
  id: string;
  itemType?: 'book' | 'website'; // Defaults to 'book' if undefined for backward compat
  url?: string; // Only for websites
  title: string;
  author: string; // For websites, this can be the site name or "internet"
  rating: number; // 1-5
  genre: string; // Category
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

export interface Ornament {
  id: string;
  type: 'fm-player';
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
  url?: string;
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
  '#daeaf6', // Pale Blue
  '#fff1e6', // Soft Peach
  '#fad2e1', // Light Pink
  '#c5dedd', // Muted Teal
  '#dbe7e4', // Grayish Cyan
  '#f0efeb', // Foggy Grey
  '#eddcd2', // Warm Beige
  '#a8e6cf'  // Mint Green
];

export const INITIAL_BOOKS: Book[] = [
  { id: '1', itemType: 'book', title: 'norwegian wood', author: 'haruki murakami', rating: 4, genre: 'fiction', summary: 'a nostalgic story of loss and sexuality.', emotionalImpact: 80, personalNote: 'made me feel lonely but in a good way.', color: '#daeaf6', spineStyle: 'simple', height: 95, rotation: -1, position: { shelfId: 0, xOffset: 50 } },
  { id: '2', itemType: 'book', title: 'educated', author: 'tara westover', rating: 5, genre: 'memoir', summary: 'a woman who grows up in a survivalist family goes to college.', emotionalImpact: 90, personalNote: 'incredible resilience.', color: '#fce1e4', spineStyle: 'pattern-lines', height: 92, rotation: 1, position: { shelfId: 0, xOffset: 110 } },
  { id: '3', itemType: 'book', title: 'atomic habits', author: 'james clear', rating: 4.5, genre: 'self-help', summary: 'tiny changes, remarkable results.', emotionalImpact: 40, personalNote: 'very practical.', color: '#fcf4dd', spineStyle: 'modern', height: 88, rotation: 0, position: { shelfId: 0, xOffset: 170 } }
];

export const INITIAL_ORNAMENTS: Ornament[] = [
  { id: 'fm-player-default', type: 'fm-player', position: { shelfId: 1, xOffset: 100 } }
];