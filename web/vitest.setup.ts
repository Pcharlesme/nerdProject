import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Vitest doesn't expose `afterEach` as a global by default, so React Testing
// Library's automatic post-test cleanup never registers — without this, DOM
// from one test's render() leaks into the next test's queries.
afterEach(() => {
  cleanup();
});
