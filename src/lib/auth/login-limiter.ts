// Simple in-memory limit on failed logins: 5 failures per key (email + IP) in
// 15 minutes. It lives in the server process, so it resets on restart and is
// not shared between several servers. That is enough for an internal tool.

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Entry = { failures: number; resetAt: number };

const attempts = new Map<string, Entry>();

function getEntry(key: string): Entry | undefined {
  const entry = attempts.get(key);

  if (entry && entry.resetAt <= Date.now()) {
    attempts.delete(key);
    return undefined;
  }

  return entry;
}

export function checkLoginAllowed(
  key: string,
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const entry = getEntry(key);

  if (entry && entry.failures >= MAX_FAILURES) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - Date.now()) / 1000),
    };
  }

  return { allowed: true };
}

export function recordLoginFailure(key: string) {
  const entry = getEntry(key);

  if (entry) {
    entry.failures += 1;
  } else {
    attempts.set(key, { failures: 1, resetAt: Date.now() + WINDOW_MS });
  }
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
