/**
 * Converts a number to Indian Currency words (Rupees ... Only)
 * Supports Units, Tens, Hundreds, Thousands, Lakhs, Crores
 */

const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertBelowThousand(n: number): string {
  if (n === 0) return '';
  let str = '';
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + ' ';
  }
  return str.trim();
}

export function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) {
    return 'Rupees Zero Only';
  }

  const rounded = Math.round(Math.abs(amount));
  const crores = Math.floor(rounded / 10000000);
  let remainder = rounded % 10000000;

  const lakhs = Math.floor(remainder / 100000);
  remainder %= 100000;

  const thousands = Math.floor(remainder / 1000);
  const belowThousand = remainder % 1000;

  let result = 'Rupees ';

  if (crores > 0) {
    result += convertBelowThousand(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    result += convertBelowThousand(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    result += convertBelowThousand(thousands) + ' Thousand ';
  }
  if (belowThousand > 0) {
    result += convertBelowThousand(belowThousand) + ' ';
  }

  // Handle paise if any
  const paise = Math.round((Math.abs(amount) - rounded) * 100);
  if (paise > 0) {
    result += 'and ' + convertBelowThousand(paise) + ' Paise ';
  }

  result = result.replace(/\s+/g, ' ').trim() + ' Only';
  return result;
}

export function formatINR(val: number, showDecimals: boolean = true): string {
  if (val === undefined || val === null || isNaN(val)) {
    return '₹0.00';
  }
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  
  const parts = absVal.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian number grouping: last 3 digits, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const symbol = isNegative ? '-₹' : '₹';
  return showDecimals ? `${symbol}${formatted}.${decimalPart}` : `${symbol}${formatted}`;
}

export function formatDateIndian(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}
