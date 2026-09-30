// Links are shown to everyone as <a href>, so only web addresses are allowed.
// Anything else (for example "javascript:") could run code when clicked.
export function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}
