import type { ServiceOrder } from "../schemas/response.schema";

export type ChatFlow = "recommend" | "agent";

export type SelectedImage = {
  uri: string;
  base64: string;
  name: string;
};

export type SubmittedPrompt = {
  text: string;
  image: SelectedImage | null;
  flow: ChatFlow;
};

export type RecommendationCard = {
  id: string;
  name: string;
  category?: string | null;
  distance_km: number;
  match_score: number;
  trust_score?: number | null;
  hourly_rate_egp?: number | null;
  isAssigned?: boolean;
};

export type ChatEntry =
  | {
      id: string;
      type: "user";
      text: string;
      image: SelectedImage | null;
      flow: ChatFlow;
    }
  | {
      id: string;
      type: "assistant";
      text: string;
      flow: ChatFlow;
    }
  | {
      id: string;
      type: "order";
      serviceOrder: ServiceOrder;
      flow: ChatFlow;
      promptText: string;
    };
