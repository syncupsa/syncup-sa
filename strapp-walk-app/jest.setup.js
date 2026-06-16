require("@testing-library/jest-dom");
// Polyfill TextEncoder for Node.js (Jest)
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder } = require("util");
  global.TextEncoder = TextEncoder;
}
