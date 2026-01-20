export type AiRecommendationRequest = {
  matchId: number;
  playerSeat: number;
};

export type AiRecommendationResponse = {
  suggestedAction: string;
  recommendation: string;
  confidence: number;
  score: number;
  description: string;
  payload: any | null;
};