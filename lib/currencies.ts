export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // 1 USD in this currency
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateAgainstUSD: 1.0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateAgainstUSD: 0.92,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateAgainstUSD: 0.79,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rateAgainstUSD: 83.5,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    rateAgainstUSD: 1.36,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    rateAgainstUSD: 1.52,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    rateAgainstUSD: 155.0,
  },
};

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const converted = amount * currency.rateAgainstUSD;
  
  if (currencyCode === 'JPY' || currencyCode === 'INR') {
    return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${currency.symbol}${converted.toFixed(2)}`;
}

export function convertFromUSD(amountUSD: number, targetCurrency: string): number {
  const currency = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.USD;
  return amountUSD * currency.rateAgainstUSD;
}

export function convertToUSD(amountLocal: number, sourceCurrency: string): number {
  const currency = SUPPORTED_CURRENCIES[sourceCurrency] || SUPPORTED_CURRENCIES.USD;
  return amountLocal / currency.rateAgainstUSD;
}
