import '@testing-library/jest-dom';
import React from 'react';

// Make React available globally for JSX
globalThis.React = React;

// ── Browser API mocks for jsdom ──────────────────────────────────────────────

// IntersectionObserver is not implemented in jsdom
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
}

// ResizeObserver is not implemented in jsdom
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// Set up test environment variables (only if not already set for integration tests)
if (!process.env.FEC_API_KEY) {
  process.env.FEC_API_KEY = 'test-api-key';
}
if (!process.env.CONGRESS_API_KEY) {
  process.env.CONGRESS_API_KEY = 'test-congress-key';
}
