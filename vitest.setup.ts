import '@testing-library/jest-dom';
import React from 'react';

// Make React available globally for JSX
globalThis.React = React;

// Set up test environment variables (only if not already set for integration tests)
if (!process.env.FEC_API_KEY) {
  process.env.FEC_API_KEY = 'test-api-key';
}
if (!process.env.CONGRESS_API_KEY) {
  process.env.CONGRESS_API_KEY = 'test-congress-key';
}
