/**
 * Core formatting utilities for the application
 * Provides consistent formatting for numbers, dates, currencies, and text
 */

/**
 * Format a number using compact notation
 * @param number - The number to format
 * @param locale - The locale to use (default: "en-US")
 * @param maximumFractionDigits - Maximum decimal places (default: 1)
 * @returns Formatted compact number
 * @example
 * formatCompactNumber(1000) → "1K"
 * formatCompactNumber(2500000, "en-US", 1) → "2.5M"
 * formatCompactNumber(1234567890, "en-US", 2) → "1.23B"
 */
export function formatCompactNumber(
  number: number,
  locale: string = "en-US",
  maximumFractionDigits: number = 1,
): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits,
  }).format(number);
}

/**
 * Format dates with timezone support
 * @param date - Date to format (Date, string, or number)
 * @param options - Intl.DateTimeFormatOptions for customization
 * @param locale - Locale string (default: "en-US")
 * @param useUTC - Force UTC timezone (default: false)
 * @param includeTime - Include time in output (default: false)
 * @returns Formatted date string
 * @example
 * // Date-only strings (YYYY-MM-DD) are always treated as UTC
 * formatDate("2025-05-21") → "May 21, 2025"
 * formatDate("2024-10-01", { weekday: "long" }) → "Tuesday"
 *
 * // ISO timestamps display in user's local timezone by default
 * formatDate("2025-05-21T18:30:00Z") → "May 21, 2025" (local)
 * formatDate("2025-05-21T18:30:00Z", undefined, "en-US", true) → "May 21, 2025" (UTC)
 *
 * // Numeric timestamps (seconds or milliseconds)
 * formatDate(1640995200) → "Jan 1, 2022"
 */
export function formatDate(
  date: Date | string | number | null,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  locale: string = "en-US",
  useUTC: boolean = false,
  includeTime: boolean = false,
): string {
  if (!date) return "";

  let d: Date;
  let isDateOnly = false;

  if (typeof date === "string") {
    const s = date.trim();

    // Detect YYYY-MM-DD (date-only)
    if (s.length === 10 && s[4] === "-" && s[7] === "-") {
      isDateOnly = true;
      const [y, m, dd] = s.split("-").map(Number);
      d = new Date(Date.UTC(y, m - 1, dd, 0, 0, 0, 0));
    } else {
      d = new Date(s);
    }
  } else if (typeof date === "number") {
    // Handle numeric timestamps
    // If the number is 10 digits, assume seconds and convert to milliseconds
    const isSeconds = date.toString().length === 10;
    const timestamp = isSeconds ? date * 1000 : date;

    d = new Date(timestamp);
  } else {
    // Date object or something passed to Date constructor
    d = new Date(date);
  }

  if (!(d instanceof Date) || isNaN(d.getTime())) return "";

  const timeZone = isDateOnly ? "UTC" : useUTC ? "UTC" : undefined;

  const formatOptions: Intl.DateTimeFormatOptions = {
    ...options,
    timeZone,
  };

  if (includeTime) {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
  }

  return d.toLocaleString(locale, formatOptions);
}

/**
 * Format a date relative to now
 * @param date - Date to format (Date, string, or number)
 * @returns Formatted relative date string
 * @example
 * formatRelativeDate(new Date()) → "just now"
 * formatRelativeDate(Date.now() - 3600000) → "1 hour ago"
 */
export function formatRelativeDate(date: Date | string | number): string {
  try {
    // Use dynamic import for date-fns to avoid SSR issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { formatRelative } = require("date-fns");
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    // Ensure date is valid
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return formatDate(date);
    }

    return formatRelative(dateObj, new Date());
  } catch {
    // Fallback if date-fns not available or SSR
    return formatDate(date);
  }
}

/**
 * Format a duration in milliseconds to human-readable format
 * @param milliseconds - Duration in milliseconds
 * @param short - Use short format (default: false)
 * @returns Formatted duration string
 * @example
 * formatDuration(5000) → "5 seconds"
 * formatDuration(65000) → "1 minute"
 * formatDuration(3665000) → "1 hour, 1 minute"
 * formatDuration(3665000, true) → "1h 1m"
 */
export function formatDuration(
  milliseconds: number,
  short: boolean = false,
): string {
  if (milliseconds < 0) return "0s";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}${short ? "d" : ` day${days !== 1 ? "s" : ""}`}`);
  }
  if (hours % 24 > 0) {
    parts.push(
      `${hours % 24}${short ? "h" : ` hour${hours % 24 !== 1 ? "s" : ""}`}`,
    );
  }
  if (minutes % 60 > 0) {
    parts.push(
      `${minutes % 60}${short ? "m" : ` minute${minutes % 60 !== 1 ? "s" : ""}`}`,
    );
  }
  if (seconds % 60 > 0 && parts.length === 0) {
    parts.push(
      `${seconds % 60}${short ? "s" : ` second${seconds % 60 !== 1 ? "s" : ""}`}`,
    );
  }

  if (parts.length === 0) return short ? "0s" : "0 seconds";

  return short ? parts.join(" ") : parts.join(", ");
}

/**
 * Format a number as currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: "USD")
 * @param decimalPlaces - Number of decimal places (default: 0)
 * @returns Formatted currency string or null if invalid
 * @example
 * formatCurrency(1234) → "$1,234"
 * formatCurrency(1234.56, "USD", 2) → "$1,234.56"
 * formatCurrency(9876.54, "EUR") → "€9,877"
 * formatCurrency(null) → null
 */
export function formatCurrency(
  amount?: number | string | null,
  currency: string | null = "USD",
  decimalPlaces: number = 0,
): string | null {
  if (amount == null) return null;

  const parsedAmount =
    typeof amount === "number" ? amount : parseFloat(amount.toString());
  if (isNaN(parsedAmount)) return null;

  const resolvedCurrency = currency?.toUpperCase() || "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: resolvedCurrency,
    maximumFractionDigits: decimalPlaces,
  }).format(parsedAmount);
}

/**
 * Format a number as a percentage
 * @param value - Value to format (0-100 or 0-1 depending on isDecimal)
 * @param decimalPlaces - Number of decimal places (default: 0)
 * @param isDecimal - Whether input is decimal (0-1) vs whole number (0-100) (default: false)
 * @returns Formatted percentage string
 * @example
 * formatPercentage(75) → "75%"
 * formatPercentage(75.5, 1) → "75.5%"
 * formatPercentage(0.755, 1, true) → "75.5%"
 */
export function formatPercentage(
  value: number,
  decimalPlaces: number = 0,
  isDecimal: boolean = false,
): string {
  const normalizedValue = isDecimal ? value * 100 : value;
  return `${normalizedValue.toFixed(decimalPlaces)}%`;
}

/**
 * Format file size in bytes to human-readable format
 * @param size - Size in bytes
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted size string
 * @example
 * formatFileSize(0) → "0 bytes"
 * formatFileSize(1024) → "1 KB"
 * formatFileSize(1536, 1) → "1.5 KB"
 * formatFileSize(1048576) → "1 MB"
 */
export function formatFileSize(
  size: number | null | undefined,
  precision: number = 2,
): string {
  if (size == null || size < 0 || isNaN(size)) {
    return "0 bytes";
  }

  if (size === 0) {
    return "0 bytes";
  }

  const k = 1024;
  const dm = precision < 0 ? 0 : precision;
  const sizes = ["bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(size) / Math.log(k));
  const unitIndex = Math.min(i, sizes.length - 1);

  const value = parseFloat((size / Math.pow(k, unitIndex)).toFixed(dm));

  return `${value} ${sizes[unitIndex]}`;
}

/**
 * Convert snake_case or kebab-case to Title Case
 * @param text - Text to format
 * @returns Formatted title case string
 * @example
 * formatToTitleCase("hello_world") → "Hello World"
 * formatToTitleCase("hello-world") → "Hello World"
 * formatToTitleCase("hello_world_and_friends") → "Hello World and Friends"
 */
export function formatToTitleCase(text: string | null | undefined): string {
  if (!text) return "Unknown";

  const lowerCaseExceptions = [
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "as",
    "if",
  ];

  return text
    .trim()
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i !== 0 && lowerCaseExceptions.includes(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/**
 * Truncate text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 50)
 * @param ellipsis - Ellipsis string (default: "...")
 * @returns Truncated text
 * @example
 * truncateText("Hello World", 5) → "Hello..."
 * truncateText("Short", 10) → "Short"
 * truncateText("Hello World", 8, "..") → "Hello W.."
 */
export function truncateText(
  text: string,
  maxLength: number = 50,
  ellipsis: string = "...",
): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + ellipsis;
}

/**
 * Mask a value by showing only the first few characters
 * @param value - Value to mask
 * @param visibleCount - Number of visible characters (default: 3)
 * @param maskChar - Character to use for masking (default: "•")
 * @returns Masked value
 * @example
 * maskValue("1234567890", 3) → "123•••••"
 * maskValue("secret", 0) → "•••••"
 * maskValue("abc", 5) → "abc•••••"
 */
export function maskValue(
  value: string,
  visibleCount: number = 3,
  maskChar: string = "•",
): string {
  if (!value) return "";
  const visible = value.slice(0, visibleCount);
  const hidden = maskChar.repeat(5);
  return visible + hidden;
}

/**
 * Format a number as an ordinal
 * @param n - Number to format
 * @returns Formatted ordinal string
 * @example
 * formatOrdinal(1) → "1st"
 * formatOrdinal(2) → "2nd"
 * formatOrdinal(3) → "3rd"
 * formatOrdinal(11) → "11th"
 * formatOrdinal(21) → "21st"
 */
export function formatOrdinal(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return `${n}st`;
  if (mod10 === 2 && mod100 !== 12) return `${n}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${n}rd`;

  return `${n}th`;
}

/**
 * Pluralize a word based on count
 * @param count - The count to check
 * @param singular - Singular form of the word
 * @param plural - Plural form of the word (optional, defaults to singular + "s")
 * @param includeCount - Whether to include the count in the output (default: true)
 * @returns Pluralized string
 * @example
 * pluralize(1, "item") → "1 item"
 * pluralize(5, "item") → "5 items"
 * pluralize(1, "person", "people") → "1 person"
 * pluralize(5, "person", "people") → "5 people"
 * pluralize(0, "file", "files", false) → "files"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
  includeCount: boolean = true,
): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return includeCount ? `${count} ${word}` : word;
}
