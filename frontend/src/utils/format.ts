import { settingService } from '../services/settingService';

const STORAGE_KEY = 'app_currency';
const EX_RATE_KEY = 'app_exchange_rate';

// All prices are stored in PKR. To convert to another currency:
// price_in_currency = price_in_PKR * exchange_rate
// e.g., 1 PKR = 0.0036 USD → exchange_rate = 0.0036
const currencySymbols: Record<string, string> = {
  PKR: 'Rs. ',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  BDT: '৳',
  AED: 'د.إ',
  SAR: '﷼',
};

// Default rates (approximate) — used only if no rate set in settings
const defaultRates: Record<string, number> = {
  PKR: 1,
  USD: 0.0036,
  EUR: 0.0033,
  GBP: 0.0028,
  INR: 0.30,
  BDT: 0.42,
  AED: 0.013,
  SAR: 0.014,
};

function getStoredCurrency(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'PKR';
  } catch {
    return 'PKR';
  }
}

function storeCurrency(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {}
}

function getStoredRate(): number {
  try {
    const r = localStorage.getItem(EX_RATE_KEY);
    return r ? parseFloat(r) : 1;
  } catch {
    return 1;
  }
}

function storeRate(rate: number) {
  try {
    localStorage.setItem(EX_RATE_KEY, String(rate));
  } catch {}
}

let loaded = false;

export async function loadCurrency() {
  if (loaded) return;
  const stored = getStoredCurrency();
  if (stored !== 'PKR') {
    loaded = true;
    return;
  }
  try {
    const res = await settingService.get();
    const data = res.data.data || {};
    const code = (data.currency || 'PKR').toUpperCase();
    storeCurrency(code);
    if (data.exchange_rate) {
      storeRate(parseFloat(data.exchange_rate));
    }
  } catch {}
  loaded = true;
}

export function setCurrency(code: string) {
  storeCurrency(code.toUpperCase());
}

export function setExchangeRate(rate: number) {
  storeRate(rate);
}

function getExchangeRate(): number {
  const code = getStoredCurrency();
  if (code === 'PKR') return 1;
  const stored = getStoredRate();
  // If stored rate equals 1 (default), try the default rate for that currency
  if (stored === 1) return defaultRates[code] || 1;
  return stored;
}

export function getCurrencySymbol(): string {
  const code = getStoredCurrency();
  return currencySymbols[code] || code + ' ';
}

export function formatPrice(value: number | undefined | null): string {
  const code = getStoredCurrency();
  const sym = currencySymbols[code] || code + ' ';
  const rate = getExchangeRate();
  const converted = (value ?? 0) * rate;
  return sym + converted.toFixed(2);
}

export function getCurrencyCode(): string {
  return getStoredCurrency();
}
