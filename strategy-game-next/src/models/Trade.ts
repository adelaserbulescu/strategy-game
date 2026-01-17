export interface TradeOffer {
  id: number;
  matchId: number;
  from: number;
  to: number; // -1 = public
  give: string;
  get: string;
  status: "OPEN" | "ACCEPTED" | "CLOSED";
  createdAt: string;
  expiresAt: string;
  acceptedBySeat: number | null;
  closedAt: string | null;
}
