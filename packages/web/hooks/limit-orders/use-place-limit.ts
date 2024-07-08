import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { priceToTick } from "@osmosis-labs/math";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAmountInput } from "~/hooks/input/use-amount-input";
import { useOrderbook } from "~/hooks/limit-orders/use-orderbook";
import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
import { useSwap, useSwapAssets } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

export type OrderDirection = "bid" | "ask";

export interface UsePlaceLimitParams {
  osmosisChainId: string;
  orderDirection: OrderDirection;
  useQueryParams?: boolean;
  useOtherCurrencies?: boolean;
  baseDenom: string;
  quoteDenom: string;
  type: "limit" | "market";
}

export type PlaceLimitState = ReturnType<typeof usePlaceLimit>;

// TODO: adjust as necessary
const CLAIM_BOUNTY = "0.001";

export const usePlaceLimit = ({
  osmosisChainId,
  quoteDenom,
  baseDenom,
  orderDirection,
  useQueryParams = false,
  useOtherCurrencies = false,
  type,
}: UsePlaceLimitParams) => {
  const { accountStore } = useStore();
  const {
    makerFee,
    isMakerFeeLoading,
    contractAddress: orderbookContractAddress,
    poolId,
  } = useOrderbook({
    quoteDenom,
    baseDenom,
  });
  const priceState = useLimitPrice({
    orderbookContractAddress,
    orderDirection,
  });

  const isMarket = useMemo(
    () => type === "market" || priceState.isBeyondOppositePrice,
    [type, priceState.isBeyondOppositePrice]
  );

  const swapAssets = useSwapAssets({
    initialFromDenom: baseDenom,
    initialToDenom: quoteDenom,
    useQueryParams,
    useOtherCurrencies,
  });

  const inAmountInput = useAmountInput({
    currency: swapAssets.fromAsset,
  });

  const marketState = useSwap({
    initialFromDenom: orderDirection === "ask" ? baseDenom : quoteDenom,
    initialToDenom: orderDirection === "ask" ? quoteDenom : baseDenom,
    useQueryParams: false,
    useOtherCurrencies: false,
    forceSwapInPoolId: poolId,
    maxSlippage: new Dec(0.1),
  });

  const quoteAsset = swapAssets.toAsset;
  const baseAsset = swapAssets.fromAsset;

  const account = accountStore.getWallet(osmosisChainId);

  // TODO: Readd this once orderbooks support non-stablecoin pairs
  // const { price: quoteAssetPrice } = usePrice({
  //   coinMinimalDenom: quoteAsset?.coinMinimalDenom ?? "",
  // });
  const quoteAssetPrice = useMemo(
    () => new PricePretty(DEFAULT_VS_CURRENCY, new Dec(1)),
    []
  );

  /**
   * Calculates the amount of tokens to be sent with the order.
   * In the case of an Ask order the amount sent is the amount of tokens defined by the user in terms of the base asset.
   * In the case of a Bid order the amount sent is the requested fiat amount divided by the current quote asset price.
   * The amount is then multiplied by the number of decimal places the quote asset has.
   *
   * @returns The amount of tokens to be sent with the order in base asset amounts for an Ask and quote asset amounts for a Bid.
   */
  const paymentTokenValue = useMemo(() => {
    // The amount of tokens the user wishes to buy/sell
    const baseTokenAmount =
      inAmountInput.amount ?? new CoinPretty(baseAsset!, new Dec(0));
    if (orderDirection === "ask") {
      // In the case of an Ask we just return the amount requested to sell
      return baseTokenAmount;
    }

    const price = isMarket
      ? orderDirection === "bid"
        ? priceState.askSpotPrice
        : priceState.bidSpotPrice
      : priceState.price;
    // Determine the outgoing fiat amount the user wants to buy
    const outgoingFiatValue = mulPrice(
      baseTokenAmount,
      new PricePretty(DEFAULT_VS_CURRENCY, price ?? new Dec(1)),
      DEFAULT_VS_CURRENCY
    );

    // Determine the amount of quote asset tokens to send by dividing the outgoing fiat amount by the current quote asset price
    // Multiply by 10^n where n is the amount of decimals for the quote asset
    const quoteTokenAmount = outgoingFiatValue!
      .quo(quoteAssetPrice ?? new Dec(1))
      .toDec()
      .mul(new Dec(Math.pow(10, quoteAsset!.coinDecimals)));
    return new CoinPretty(quoteAsset!, quoteTokenAmount);
  }, [
    quoteAssetPrice,
    baseAsset,
    orderDirection,
    inAmountInput.amount,
    quoteAsset,
    priceState.price,
    isMarket,
    priceState.askSpotPrice,
    priceState.bidSpotPrice,
  ]);

  /**
   * Determines the fiat amount the user will pay for their order.
   * In the case of an Ask the fiat amount is the amount of tokens the user will sell multiplied by the currently selected price.
   * In the case of a Bid the fiat amount is the amount of quote asset tokens the user will send multiplied by the current price of the quote asset.
   */
  const paymentFiatValue = useMemo(() => {
    return orderDirection === "ask"
      ? mulPrice(
          paymentTokenValue,
          new PricePretty(DEFAULT_VS_CURRENCY, priceState.price),
          DEFAULT_VS_CURRENCY
        )
      : mulPrice(paymentTokenValue, quoteAssetPrice, DEFAULT_VS_CURRENCY);
  }, [paymentTokenValue, orderDirection, quoteAssetPrice, priceState]);

  /**
   * When creating a market order we want to update the market state with the input amount
   * with the amount of base tokens.
   *
   * Only runs on an ASK order. A BID order is handled by the input directly.
   */
  useEffect(() => {
    if (orderDirection === "bid") return;

    const normalizedAmount = paymentTokenValue.toDec().toString();
    marketState.inAmountInput.setAmount(normalizedAmount);
  }, [paymentTokenValue, orderDirection, marketState.inAmountInput]);

  const placeLimit = useCallback(async () => {
    const quantity = paymentTokenValue.toCoin().amount ?? "0";
    if (quantity === "0") {
      return;
    }

    if (isMarket) {
      await marketState.sendTradeTokenInTx();
      return;
    }

    const paymentDenom = paymentTokenValue.toCoin().denom;
    // The requested price must account for the ratio between the quote and base asset as the base asset may not be a stablecoin.
    // To account for this we divide by the quote asset price.
    const tickId = priceToTick(priceState.price.quo(quoteAssetPrice.toDec()));
    const msg = {
      place_limit: {
        tick_id: parseInt(tickId.toString()),
        order_direction: orderDirection,
        quantity,
        claim_bounty: CLAIM_BOUNTY,
      },
    };
    try {
      await account?.cosmwasm.sendExecuteContractMsg(
        "executeWasm",
        orderbookContractAddress,
        msg,
        [
          {
            amount: quantity,
            denom: paymentDenom,
          },
        ]
      );
    } catch (error) {
      console.error("Error attempting to broadcast place limit tx", error);
    }
  }, [
    orderbookContractAddress,
    account,
    orderDirection,
    priceState,
    paymentTokenValue,
    isMarket,
    marketState,
    quoteAssetPrice,
  ]);

  const { data: baseTokenBalance, isLoading: isBaseTokenBalanceLoading } =
    api.local.balances.getUserBalances.useQuery(
      { bech32Address: account?.address ?? "" },
      {
        enabled: !!account?.address,
        select: (balances) =>
          balances.find(({ denom }) => denom === baseAsset?.coinMinimalDenom)
            ?.coin,
      }
    );
  const { data: quoteTokenBalance, isLoading: isQuoteTokenBalanceLoading } =
    api.local.balances.getUserBalances.useQuery(
      { bech32Address: account?.address ?? "" },
      {
        enabled: !!account?.address,
        select: (balances) =>
          balances.find(({ denom }) => denom === quoteAsset?.coinMinimalDenom)
            ?.coin,
      }
    );

  const insufficientFunds =
    (orderDirection === "bid"
      ? quoteTokenBalance?.toDec()?.lt(paymentTokenValue.toDec() ?? new Dec(0))
      : baseTokenBalance
          ?.toDec()
          ?.lt(paymentTokenValue.toDec() ?? new Dec(0))) ?? true;

  const expectedTokenAmountOut = useMemo(() => {
    const preFeeAmount =
      orderDirection === "ask"
        ? new CoinPretty(
            quoteAsset!,
            paymentFiatValue?.quo(quoteAssetPrice?.toDec() ?? new Dec(1)) ??
              new Dec(1)
          ).mul(new Dec(Math.pow(10, quoteAsset!.coinDecimals)))
        : inAmountInput.amount ?? new CoinPretty(baseAsset!, new Dec(0));
    return preFeeAmount.mul(new Dec(1).sub(makerFee));
  }, [
    inAmountInput.amount,
    baseAsset,
    quoteAsset,
    orderDirection,
    makerFee,
    quoteAssetPrice,
    paymentFiatValue,
  ]);

  const expectedFiatAmountOut = useMemo(() => {
    return orderDirection === "ask"
      ? new PricePretty(
          DEFAULT_VS_CURRENCY,
          quoteAssetPrice?.mul(expectedTokenAmountOut.toDec()) ?? new Dec(0)
        )
      : new PricePretty(
          DEFAULT_VS_CURRENCY,
          priceState.price?.mul(expectedTokenAmountOut.toDec()) ?? new Dec(0)
        );
  }, [
    priceState.price,
    expectedTokenAmountOut,
    orderDirection,
    quoteAssetPrice,
  ]);

  return {
    baseAsset,
    quoteAsset,
    priceState,
    inAmountInput,
    placeLimit,
    baseTokenBalance,
    quoteTokenBalance,
    isBalancesFetched:
      !isBaseTokenBalanceLoading && !isQuoteTokenBalanceLoading,
    insufficientFunds,
    paymentFiatValue,
    makerFee,
    isMakerFeeLoading,
    expectedTokenAmountOut,
    expectedFiatAmountOut,
    marketState,
    isMarket,
    quoteAssetPrice,
  };
};

const useLimitPrice = ({
  orderbookContractAddress,
  orderDirection,
}: {
  orderbookContractAddress: string;
  orderDirection: OrderDirection;
}) => {
  const { data, isLoading } = api.edge.orderbooks.getOrderbookState.useQuery({
    osmoAddress: orderbookContractAddress,
  });
  const [orderPrice, setOrderPrice] = useState("");
  const [manualPercentAdjusted, setManualPercentAdjusted] = useState("");

  const spotPrice = useMemo(() => {
    if (!data) return new Dec(1);
    return orderDirection === "ask" ? data.askSpotPrice : data.bidSpotPrice;
  }, [orderDirection, data]);

  const adjustByPercentage = useCallback(
    (percentage: Dec) => {
      setOrderPrice(
        formatPretty((spotPrice ?? new Dec(0)).mul(new Dec(1).add(percentage)))
      );
    },
    [spotPrice]
  );

  useEffect(() => {
    if (manualPercentAdjusted.length > 0) {
      const adjustment = new Dec(manualPercentAdjusted).quo(new Dec(100));
      if (adjustment.isNegative()) return adjustByPercentage(new Dec(0));

      adjustByPercentage(
        orderDirection === "ask" ? adjustment : adjustment.mul(new Dec(-1))
      );
    } else {
      adjustByPercentage(new Dec(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualPercentAdjusted, orderDirection]);

  const isValidPrice = useMemo(
    () =>
      Boolean(orderPrice) &&
      orderPrice.length > 0 &&
      !new Dec(orderPrice).isZero() &&
      new Dec(orderPrice).isPositive(),
    [orderPrice]
  );

  const percentAdjusted = useMemo(
    () =>
      isValidPrice
        ? new Dec(orderPrice).quo(spotPrice ?? new Dec(1)).sub(new Dec(1))
        : new Dec(0),
    [isValidPrice, orderPrice, spotPrice]
  );
  const price = useMemo(
    () => (isValidPrice ? new Dec(orderPrice) : spotPrice ?? new Dec(1)),
    [isValidPrice, orderPrice, spotPrice]
  );

  const isBeyondOppositePrice = useMemo(() => {
    if (!data) return false;
    return orderDirection === "ask"
      ? data.bidSpotPrice.gte(price)
      : data.askSpotPrice.lte(price);
  }, [orderDirection, data, price]);

  const priceFiat = useMemo(() => {
    return new PricePretty(DEFAULT_VS_CURRENCY, price);
  }, [price]);

  const reset = useCallback(() => {
    setManualPercentAdjusted("");
    setOrderPrice("");
  }, []);

  const setPrice = useCallback((price: string) => {
    if (!price) {
      setOrderPrice("");
    } else {
      setOrderPrice(price);
    }
  }, []);

  const setPercentAdjusted = useCallback(
    (percentAdjusted: string) => {
      if (!percentAdjusted) {
        setManualPercentAdjusted("");
      } else {
        setManualPercentAdjusted(percentAdjusted);
      }
    },
    [setManualPercentAdjusted]
  );

  useEffect(() => {
    reset();
  }, [orderDirection, reset]);
  return {
    spotPrice,
    orderPrice,
    price,
    priceFiat,
    adjustByPercentage,
    manualPercentAdjusted,
    setPercentAdjusted,
    percentAdjusted,
    isLoading,
    reset,
    setPrice,
    isValidPrice,
    isBeyondOppositePrice,
    bidSpotPrice: data?.bidSpotPrice,
    askSpotPrice: data?.askSpotPrice,
  };
};
