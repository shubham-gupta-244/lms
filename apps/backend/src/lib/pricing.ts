export interface ConvertedPrice {
  amount: number;
  formatted: string;
}

function toMajorUnits(minorUnits: number): ConvertedPrice {
  const amount = Math.round(minorUnits) / 100;
  return { amount, formatted: amount.toFixed(2) };
}

export function paiseToRupees(pricePaise: number): ConvertedPrice {
  return toMajorUnits(pricePaise);
}

export function centsToDollars(priceUsdCents: number): ConvertedPrice {
  return toMajorUnits(priceUsdCents);
}
