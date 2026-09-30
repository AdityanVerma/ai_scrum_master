import bcrypt from 'bcryptjs';

const COST = 12;

export const PASSWORD_MIN_LENGTH = 8;

// bcrypt ignores everything after 72 bytes, so longer passwords are refused.
const PASSWORD_MAX_BYTES = 72;

// Hash of a random password nobody knows. Login compares against it when the
// email is unknown, so a wrong email takes as long as a wrong password.
const DUMMY_HASH =
  '$2b$12$w.MfE3av7rmsFQeuqNg72ujuYg6heRbj6QgvZZ.e7JTg51QcVL01i';

// Returns an error message, or null when the password is acceptable.
export function validateNewPassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (Buffer.byteLength(password) > PASSWORD_MAX_BYTES) {
    return `Password must be at most ${PASSWORD_MAX_BYTES} bytes.`;
  }

  return null;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, COST);
}

// Pass null when the account does not exist or has no password set: the result
// is always false, but the time taken is the same.
export async function verifyPassword(
  password: string,
  hash: string | null | undefined,
) {
  const matches = await bcrypt.compare(password, hash ?? DUMMY_HASH);

  return matches && Boolean(hash);
}
