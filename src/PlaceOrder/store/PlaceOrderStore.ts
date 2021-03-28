import { observable, computed, action } from "mobx";

import { OrderSide, ProfitTarget } from "../model";

const defaultProfitTargets: ProfitTarget[] = [
  {
    id: 0,
    profit: 2,
    tradePrice: 0,
    amountToSell: 100,
  },
];

export class PlaceOrderStore {
  @observable activeOrderSide: OrderSide = "buy";
  @observable price: number = 0;
  @observable amount: number = 0;
  @observable isTakeProfitSwitchOn: boolean = false;
  @observable profitTargets: ProfitTarget[] = defaultProfitTargets;

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
      this.setProfitTargets(defaultProfitTargets);
    }

    this.isTakeProfitSwitchOn = value;
  }

  @action.bound
  public removeProfitTarget(id: number) {
    this.setProfitTargets(this.profitTargets.filter((item) => item.id !== id));
  }

  @action.bound
  public addProfitTarget() {
    const lastItem = [...this.profitTargets][this.profitTargets.length - 1];
    const newInputs = this.profitTargets.map((item) => {
      if (item.id === 0 && item.amountToSell !== 20) {
        return { ...item, amountToSell: item.amountToSell - 20 };
      }

      return item;
    });
    const newInput = {
      id: lastItem.id + 1,
      profit: lastItem.profit + 2,
      tradePrice: 0,
      amountToSell: 20,
    };

    this.setProfitTargets([...newInputs, newInput]);
  }
}
