import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Root from "../src/routes/__root";

describe("__root SSR/CSR hydration", () => {
  it("does not render <link> or <script> with undefined/missing rel/href/src", () => {
    const { container } = render(<Root />);
    const badLinks = Array.from(container.querySelectorAll("link")).filter(
      (l) => !l.rel || !l.href || l.rel === "undefined" || l.href === "undefined",
    );
    const badScripts = Array.from(container.querySelectorAll("script")).filter(
      (s) => (!s.src && !s.textContent) || s.src === "undefined",
    );
    expect(badLinks.length).toBe(0);
    expect(badScripts.length).toBe(0);
  });
});
