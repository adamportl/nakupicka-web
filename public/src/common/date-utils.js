const REFERENCE_OFFSET = 978307200;

export function parsePurchaseDate(raw) {
  if (raw === null || raw === undefined) return new Date();
  if (typeof raw === "number") return new Date((raw + REFERENCE_OFFSET) * 1000);
  if (typeof raw === "string") {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
}

export function encodePurchaseDate(date) {
  return date.getTime() / 1000 - REFERENCE_OFFSET;
}
