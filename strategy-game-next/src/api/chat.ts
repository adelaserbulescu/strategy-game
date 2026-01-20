import {AiRecommendationRequest, AiRecommendationResponse} from "@/models/Chat";
import {chatHttp} from "@/api/chatHttp";

export function getAiRecommendation(body: AiRecommendationRequest) {
  return chatHttp<AiRecommendationResponse>("/api/chat/ai/recommendation", {
    method: "POST",
    body: JSON.stringify(body),
  });
}