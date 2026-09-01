type LogLevel = "info" | "warn" | "error";

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (level === "error") {
    console.error("[TRAIC]", payload);
  } else if (level === "warn") {
    console.warn("[TRAIC]", payload);
  } else if (process.env.NODE_ENV === "development") {
    console.info("[TRAIC]", payload);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) =>
    emit("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    emit("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    emit("error", message, meta),
};
