export function encodeTicketPayload(payload) {
  return btoa(JSON.stringify(payload));
}

export function decodeTicketPayload(value) {
  try {
    const decoded = atob(value);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
