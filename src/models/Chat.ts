export type ChatTab = "CHAT" | "AI";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "PLAYER" | "AI";
  tab: ChatTab;
  timestamp: string;
}

export interface ChatHistory {
  matchId: string;
  messages: ChatMessage[];
}

export interface AIRecommendation {
  recommendation: string;
  suggestedAction: string;
}
