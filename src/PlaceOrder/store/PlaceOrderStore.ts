import { observable, computed, action } from "mobx";

import { OrderSide, ProfitTarget } from "../model";
import { DEFAULT_AMOUNT_TO_SELL } from "PlaceOrder/constants";

export class PlaceOrderStore {
  @observable activeOrderSide: OrderSide = "buy";
  @observable price: number = 0;
  @observable amount: number = 0;
  @observable isTakeProfitSwitchOn: boolean = false;
  @observable profitTargets: ProfitTarget[] = [];

  @computed get projectProfit(): string {
    let res = 0;

    if (this.profitTargets.length > 0) {
      res = this.profitTargets
        .map((row) => {
          const multiplier = this.activeOrderSide === "buy" ? 1 : -1;

          return (
            multiplier *
            (row.amountToSell * this.amount * 0.01) *
            (row.tradePrice - this.price)
          );
        })
        .reduce((sum, item) => {
          return sum + item;
        });
    }

    return res.toFixed(2);
  }

  @computed get total(): number {
    return this.price * this.amount;
  }

  @action.bound
  public setOrderSide(side: OrderSide) {
    this.activeOrderSide = side;
  }

  @action.bound
  public setPrice(price: number) {
    this.price = price;
  }

  @action.bound
  public setAmount(amount: number) {
    this.amount = amount;
  }

  @action.bound
  public setTotal(total: number) {
    this.amount = this.price > 0 ? total / this.price : 0;
  }

  @action.bound
  public setProfitTargets(inputs: ProfitTarget[]) {
    if (inputs.length === 0 && this.isTakeProfitSwitchOn) {
      this.setIsTakeProfitSwitchOn(false);
    }

    this.profitTargets = inputs;
  }

  @action.bound
  public setIsTakeProfitSwitchOn(value: boolean) {
    if (value) {
      this.setProfitTargets([this.getDefaultProfitTarget()]);
    }

    this.isTakeProfitSwitchOn = value;
  }

  @action.bound
  public removeProfitTarget(id: number) {
    this.setProfitTargets(this.profitTargets.filter((item) => item.id !== id));
  }

  @action.bound
  private getNewProfitTarget(): ProfitTarget {
    const lastItem = this.profitTargets[this.profitTargets.length - 1];
    const newProfit = lastItem.profit + 2;

    return {
      id: lastItem.id + 1,
      profit: newProfit,
      tradePrice: this.getTradePrice(newProfit),
      amountToSell: DEFAULT_AMOUNT_TO_SELL,
    };
  }

  @action.bound
  private getNewProfitTargets(): ProfitTarget[] {
    let itemMaxId = 0;
    let maxValue = 0;
    let sumValue = 0;

    this.profitTargets.forEach((item) => {
      if (item.amountToSell > maxValue) {
        maxValue = item.amountToSell;
        itemMaxId = item.id;
      }
      sumValue += item.amountToSell;
    });

    return this.profitTargets.map((item) => {
      if (item.id === itemMaxId) {
        return {
          ...item,
          amountToSell:
            sumValue > 100 - DEFAULT_AMOUNT_TO_SELL
              ? item.amountToSell - (sumValue - (100 - DEFAULT_AMOUNT_TO_SELL))
              : item.amountToSell,
        };
      }

      return item;
    });
  }

  @action.bound
  public addProfitTarget() {
    this.setProfitTargets([
      ...this.getNewProfitTargets(),
      this.getNewProfitTarget(),
    ]);
  }

  @action.bound
  public updateField(
    field: keyof ProfitTarget,
    id: number,
    value?: number | null
  ) {
    const update = (value: number) => {
      return this.profitTargets.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }

        return row;
      });
    };

    if (value || value === 0 || value === null) {
      this.setProfitTargets(update(Number(value)));
    } else if (field === "tradePrice") {
      this.setProfitTargets(
        update(this.getTradePrice(this.profitTargets[id]?.profit ?? 0))
      );
    } else if (field === "profit") {
      this.setProfitTargets(
        update(this.getProfit(this.profitTargets[id]?.tradePrice ?? 0))
      );
    }
  }

  @action.bound
  public updateProfitTargets(price: number) {
    const newProfitTargets = this.profitTargets.map((row) => {
      return { ...row, tradePrice: this.getTradePrice(row.profit, price) };
    });

    this.setProfitTargets(newProfitTargets);
  }

  @action.bound
  private getDefaultProfitTarget(): ProfitTarget {
    return {
      id: 0,
      profit: 2,
      tradePrice: this.getTradePrice(2),
      amountToSell: 100,
    };
  }

  @action.bound
  private getTradePrice(profit: number, price = this.price): number {
    return price + price * profit * 0.01;
  }

  @action.bound
  private getProfit(tradePrice: number, price = this.price): number {
    return price ? +(((tradePrice - price) / price) * 100).toFixed(2) : 0;
  }
}
