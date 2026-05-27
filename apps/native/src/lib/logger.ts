type Level = "debug" | "info" | "warn" | "error";

type Breadcrumb = {
  category: string;
  message: string;
  level: Level;
  data?: object;
  timestamp: number;
};

type BreadcrumbSink = (b: Breadcrumb) => void;
type CaptureSink = (err: unknown, ctx?: object) => void;

let breadcrumbSink: BreadcrumbSink = () => {};
let captureSink: CaptureSink = () => {};

export function __setBreadcrumbSink(fn: BreadcrumbSink): void {
  breadcrumbSink = fn;
}

export function __setCaptureSink(fn: CaptureSink): void {
  captureSink = fn;
}

function safeCall(fn: () => void): void {
  try {
    fn();
  } catch {}
}

function emit(level: Level, category: string, message: string, data?: object): void {
  safeCall(() => {
    if (__DEV__) {
      const tag = `[${category}]`;
      if (data !== undefined) {
        console[level](tag, message, data);
      } else {
        console[level](tag, message);
      }
    }
  });
  safeCall(() => {
    breadcrumbSink({
      category,
      message,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  });
}

export const logger = {
  debug(category: string, message: string, data?: object): void {
    emit("debug", category, message, data);
  },
  info(category: string, message: string, data?: object): void {
    emit("info", category, message, data);
  },
  warn(category: string, message: string, data?: object): void {
    emit("warn", category, message, data);
  },
  error(category: string, message: string, errorOrData?: unknown): void {
    const data =
      errorOrData && typeof errorOrData === "object" && !(errorOrData instanceof Error)
        ? (errorOrData as object)
        : undefined;
    safeCall(() => {
      if (__DEV__) {
        console.error(`[${category}]`, message, errorOrData);
      }
    });
    safeCall(() => {
      breadcrumbSink({
        category,
        message,
        level: "error",
        data,
        timestamp: Date.now() / 1000,
      });
    });
    safeCall(() => {
      captureSink(errorOrData, { category, message });
    });
  },
};
