/* eslint @typescript-eslint/no-use-before-define: 0 */

import React, { useMemo, useEffect, useCallback } from "react";
import block from "bem-cn-lite";
import { AddCircle, Cancel } from "@material-ui/icons";
import { observer } from "mobx-react";

import { Switch, TextButton, NumberInput } from "components";

import { QUOTE_CURRENCY, MAX_ROWS } from "../../constants";
import { useStore } from "../../context";
import { OrderSide, ProfitTargetEnum, ProfitTargetError } from "../../model";
import "./TakeProfit.scss";

type Props = {
  orderSide: OrderSide;
};

const b = block("take-profit");

const TakeProfit: React.FC<Props> = observer(({ orderSide }) => {
  const {
    isTakeProfitSwitchOn,
    setIsTakeProfitSwitchOn,
    profitTargets,
    removeProfitTarget,
    addProfitTarget,
    updateProfitTargets,
    price,
    projectProfit,
    updateField,
    errors,
  } = useStore();

  const isDisplayButton = useMemo(() => profitTargets.length < MAX_ROWS, [
    profitTargets.length,
  ]);

  const getErrorText = useCallback(
    (id: number, field: keyof ProfitTargetError): string => {
      const error = errors?.[id]?.[field];

      if (errors && (error?.id || error?.id === 0)) {
        return errors[id][field].id === id ? errors[id][field].text : "1";
      }

      return error?.text ?? "";
    },
    [errors]
  );

  const renderInputs = useMemo(
    (): JSX.Element[] =>
      profitTargets.map(({ id, profit, tradePrice, amountToSell }) => {
        const profitError = getErrorText(id, ProfitTargetEnum.Profit);
        const tradePriceError = getErrorText(id, ProfitTargetEnum.TradePrice);
        const amountError = getErrorText(id, ProfitTargetEnum.AmountToSell);

        return (
          <div className={b("inputs")} key={id}>
            <NumberInput
              value={profit}
              InputProps={{ endAdornment: "%" }}
              variant="underlined"
              onChange={(value: number) =>
                updateField(ProfitTargetEnum.Profit, id, value)
              }
              onBlur={() => {
                updateField(ProfitTargetEnum.TradePrice, id);
              }}
              error={profitError}
            />
            <NumberInput
              value={tradePrice}
              InputProps={{ endAdornment: QUOTE_CURRENCY }}
              variant="underlined"
              onChange={(value: number) =>
                updateField(ProfitTargetEnum.TradePrice, id, value)
              }
              onBlur={() => {
                updateField(ProfitTargetEnum.Profit, id);
              }}
              error={tradePriceError}
            />
            <NumberInput
              value={amountToSell}
              decimalScale={2}
              InputProps={{ endAdornment: "%" }}
              variant="underlined"
              onBlur={(value: number) => {
                updateField(ProfitTargetEnum.AmountToSell, id, value);
              }}
              error={amountError}
            />
            <div className={b("cancel-icon")}>
              <Cancel
                onClick={() => {
                  removeProfitTarget(id);
                }}
              />
            </div>
          </div>
        );
      }),
    [profitTargets, getErrorText, updateField, removeProfitTarget]
  );

  const renderTitles = useMemo(
    () => (
      <div className={b("titles")}>
        <span>Profit</span>
        <span>Trade price</span>
        <span>Amount to {orderSide === "buy" ? "sell" : "buy"}</span>
      </div>
    ),
    [orderSide]
  );

  useEffect(() => {
    updateProfitTargets(price);
  }, [price, updateProfitTargets]);

  return (
    <div className={b()}>
      <div className={b("switch")}>
        <span>Take profit</span>
        <Switch
          checked={isTakeProfitSwitchOn}
          onChange={setIsTakeProfitSwitchOn}
        />
      </div>
      {isTakeProfitSwitchOn && (
        <div className={b("content")}>
          {renderTitles}
          {renderInputs}
          {isDisplayButton && (
            <TextButton className={b("add-button")}>
              <AddCircle className={b("add-icon")} />
              <span onClick={addProfitTarget}>
                Add profit target {profitTargets.length}/{MAX_ROWS}
              </span>
            </TextButton>
          )}
          <div className={b("projected-profit")}>
            <span className={b("projected-profit-title")}>
              Projected profit
            </span>
            <span className={b("projected-profit-value")}>
              <span>{projectProfit}</span>
              <span className={b("projected-profit-currency")}>
                {QUOTE_CURRENCY}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export { TakeProfit };
