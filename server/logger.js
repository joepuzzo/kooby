const ANSI_RESET = "\x1b[0m";
const ANSI_KEY = "\x1b[36m";
const ANSI_STRING = "\x1b[32m";
const ANSI_NUMBER = "\x1b[33m";
const ANSI_BOOLEAN = "\x1b[35m";
const ANSI_NULL = "\x1b[90m";

const prettyLogsEnabled =
  process.env.LOG_PRETTY === "1" || process.env.LOG_PRETTY === "true";

function normalizeData(data) {
  if (data instanceof Error) {
    return {
      name: data.name,
      log: data.message,
      stack: data.stack,
    };
  }

  if (Array.isArray(data)) {
    return data.map((item) => normalizeData(item));
  }

  if (data && typeof data === "object") {
    const normalized = {};
    for (const [key, value] of Object.entries(data)) {
      normalized[key] = value instanceof Error ? normalizeData(value) : value;
    }
    return normalized;
  }

  return data;
}

function colorizeJson(prettyJson) {
  return prettyJson.replace(
    /"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"\s*:|"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (token) => {
      if (token.endsWith(":")) {
        return `${ANSI_KEY}${token}${ANSI_RESET}`;
      }
      if (token.startsWith('"')) {
        return `${ANSI_STRING}${token}${ANSI_RESET}`;
      }
      if (token === "true" || token === "false") {
        return `${ANSI_BOOLEAN}${token}${ANSI_RESET}`;
      }
      if (token === "null") {
        return `${ANSI_NULL}${token}${ANSI_RESET}`;
      }
      return `${ANSI_NUMBER}${token}${ANSI_RESET}`;
    },
  );
}

function write(level, log, data) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    log,
  };

  if (data !== undefined) {
    entry.data = normalizeData(data);
  }

  const serialized = prettyLogsEnabled
    ? colorizeJson(JSON.stringify(entry, null, 2))
    : JSON.stringify(entry);
  if (level === "error") {
    process.stderr.write(`${serialized}\n`);
    return;
  }
  process.stdout.write(`${serialized}\n`);
}

const logger = {
  debug(log, data) {
    write("debug", log, data);
  },
  info(log, data) {
    write("info", log, data);
  },
  warn(log, data) {
    write("warn", log, data);
  },
  error(log, data) {
    write("error", log, data);
  },
};

export default logger;
