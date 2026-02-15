/**
 * This file is a logger utility that is used to log messages to the console.
 *
 * @example:
 * logger.debug("This is a debug message");
 * logger.info("This is an info message");
 * logger.warn("This is a warning message");
 * logger.error("This is an error message");
 * logger.table({ key: "value" , key2: "value2" }, "This is a table message");
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "table";

const LEVEL_ORDER: Record<Exclude<LogLevel, "table">, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const colors: Record<LogLevel, string> = {
  info: "color: #3b82f6",
  warn: "color: #f59e0b",
  error: "color: #ef4444",
  debug: "color: #10b981",
  table: "color: #9333EA",
};

const getTimestamp = () => {
  // Keep your format, but avoid repeated split work if you care about perf.
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

type LoggerOptions = {
  level?: Exclude<LogLevel, "table">; // minimum level
  enabled?: boolean;
  prefix?: string; // app name, etc.
};

const createLogger = (opts: LoggerOptions = {}) => {
  let enabled = opts.enabled ?? true;
  let minLevel: Exclude<LogLevel, "table"> = opts.level ?? "debug";
  const appPrefix = opts.prefix ? `[${opts.prefix}] ` : "";

  const shouldLog = (level: Exclude<LogLevel, "table">) =>
    enabled && LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];

  const fmt = (level: LogLevel, location?: string) => {
    const loc = location ? `[${location}] ` : "";
    const prefix = `%c${appPrefix}[${level.toUpperCase()}] ${getTimestamp()} ›`;
    return { prefix, loc };
  };

  const baseLog = (
    level: Exclude<LogLevel, "table">,
    location: string | undefined,
    args: unknown[],
  ) => {
    if (!shouldLog(level)) return;

    const { prefix, loc } = fmt(level, location);

    // Use proper console methods
    if (level === "warn") console.warn(prefix, colors[level], loc, ...args);
    else if (level === "error")
      console.error(prefix, colors[level], loc, ...args);
    else console.log(prefix, colors[level], loc, ...args);
  };

  const table = (data: unknown, location?: string) => {
    if (!enabled) return;
    const { prefix, loc } = fmt("table", location);
    console.log(prefix, colors.table, loc);
    console.table(data);
  };

  const scope = (location: string) => ({
    debug: (...args: unknown[]) => baseLog("debug", location, args),
    info: (...args: unknown[]) => baseLog("info", location, args),
    warn: (...args: unknown[]) => baseLog("warn", location, args),
    error: (...args: unknown[]) => baseLog("error", location, args),
    table: (data: unknown) => table(data, location),
  });

  return {
    setEnabled: (v: boolean) => (enabled = v),
    setLevel: (lvl: Exclude<LogLevel, "table">) => (minLevel = lvl),
    scope,

    debug: (...args: unknown[]) => baseLog("debug", undefined, args),
    info: (...args: unknown[]) => baseLog("info", undefined, args),
    warn: (...args: unknown[]) => baseLog("warn", undefined, args),
    error: (...args: unknown[]) => baseLog("error", undefined, args),
    table,
  };
};

export const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  enabled: true,
  prefix: "app",
});
