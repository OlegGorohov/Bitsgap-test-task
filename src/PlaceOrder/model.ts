export type OrderSide = "buy" | "sell";

export enum ProfitTargetEnum {
  Id = "id",
  Profit = "profit",
  TradePrice = "tradePrice",
  AmountToSell = "amountToSell",
  Errors = "errors",
}
interface Error {
  text: string;
  id?: number;
}
export interface ProfitTargetError {
  [ProfitTargetEnum.Profit]: Error;
  [ProfitTargetEnum.TradePrice]: Error;
  [ProfitTargetEnum.AmountToSell]: Error;
}

export interface ProfitTarget {
  [ProfitTargetEnum.Id]: number;
  [ProfitTargetEnum.Profit]: number;
  [ProfitTargetEnum.TradePrice]: number;
  [ProfitTargetEnum.AmountToSell]: number;
  [ProfitTargetEnum.Errors]?: ProfitTargetError;
}

export enum ErrorsEnum {
  SumProfit = "Maximum profit sum is 500%",
  MinProfitValue = "Minimum value is 0.01",
  PreviousValue = "Each target's profit should be greater than the previous one",
  MinTradePrice = "Price must be greater than 0",
  SumAmount = "out of 100% selected. Please decrease by",
}
