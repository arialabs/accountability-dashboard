/**
 * Shared formatting utilities
 * Consolidates duplicate formatting functions from across the codebase
 */

/**
 * Format a number as currency (USD)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a large number with K/M/B suffixes
 * @param num - The number to format
 * @returns Formatted number string (e.g., "1.2M")
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString('en-US');
}

/**
 * Format a number as a percentage
 * @param value - The value to format (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "45.2%")
 */
export function formatPercent(value: number, decimals: number = 1): string {
  if (value == null || isNaN(value)) return "N/A";
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a date string to a human-readable format
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @param format - Format style ('short' | 'long' | 'full')
 * @returns Formatted date string
 */
export function formatDate(
  dateStr: string | null | undefined,
  format: 'short' | 'long' | 'full' = 'long'
): string {
  if (!dateStr) return 'Date unavailable';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
      });
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    case 'full':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    default:
      return dateStr;
  }
}

/**
 * Format a date range for tenure display
 * @param startDate - Start date (ISO format)
 * @param endDate - End date (ISO format, optional)
 * @returns Formatted tenure string
 */
export function formatTenure(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  if (years > 0 && months > 0) {
    return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
  } else if (years > 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }
}

/**
 * Format a large currency amount with K/M/B suffixes
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1.2M")
 */
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}
