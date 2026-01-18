# Test Suite

This directory contains the test suite for the PDF Slice & Dice application.

## Overview

The test suite uses:
- **Vitest** - Fast unit test framework compatible with Vite
- **React Testing Library** - For testing React components
- **jsdom** - Browser environment simulation for tests

## Running Tests

```bash
# Run tests in watch mode (for development)
npm test

# Run tests once (for CI)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- `types.test.ts` - Tests for TypeScript types and enums
- `pdfService.test.ts` - Tests for PDF service utility functions
- `App.test.tsx` - Component tests for the main App component

## Test Coverage

Current tests cover:
- ✅ ExportFormat enum values
- ✅ downloadBlob utility function (DOM interactions)
- ✅ App component rendering
- ✅ File upload interface
- ✅ Feature tags and descriptions

## Adding New Tests

1. Create a new test file in this directory with `.test.ts` or `.test.tsx` extension
2. Import the necessary testing utilities from `vitest` and `@testing-library/react`
3. Write your tests using the `describe`, `it`, and `expect` functions
4. Run `npm test` to verify your tests pass

## CI/CD

Tests are automatically run on every push to `main` and on pull requests via GitHub Actions.
See `.github/workflows/ci.yml` for the CI configuration.
