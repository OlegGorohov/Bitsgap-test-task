export type OrderSide = "buy" | "sell";

export interface ProfitTarget {
  id: number;
  profit: number;
  tradePrice: number;
  amountToSell: number;
}
