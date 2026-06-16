import { getRouter } from "../src/router";

describe("SSR/CSR Router", () => {
  it("should not throw on SSR", () => {
    expect(() => getRouter()).not.toThrow();
  });
});
