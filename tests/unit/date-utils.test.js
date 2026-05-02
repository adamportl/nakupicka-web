import { describe, expect, it } from "vitest";
import { encodePurchaseDate, parsePurchaseDate } from "../../src/common/date-utils.js";

describe("date utils", () => {
  it("encodes and decodes purchase date", () => {
    const source = new Date("2026-05-01T12:00:00.000Z");
    const encoded = encodePurchaseDate(source);
    const decoded = parsePurchaseDate(encoded);

    expect(Math.abs(decoded.getTime() - source.getTime())).toBeLessThan(1000);
  });
});
