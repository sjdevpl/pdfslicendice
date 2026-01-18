# Test Suite

This directory contains the test suite for the PDF Slice & Dice application.

## Overview

The test suite uses:
- **Vitest** - Fast unit test framework compatible with Vite
- **React Testing Library** - For testing React components
- **jsdom** - Browser environment simulation for unit tests
- **Vitest Browser Mode** - Real browser environment for PDF rendering tests (uses Playwright)

## Running Tests

```bash
# Run unit tests in watch mode (for development)
npm test

# Run unit tests once (for CI)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run browser tests (PDF rendering, canvas operations)
npm run test:browser

# Run browser tests once (for CI)
npm run test:browser:run

# Run all tests (unit + browser)
npm run test:all

# Generate test PDF from README.md
npm run test:generate-pdf
```

## Test Types

### Unit Tests (jsdom)
Unit tests run in jsdom environment and are fast. They test:
- Component rendering
- UI logic
- Utility functions
- Type definitions

**Files:** `*.test.ts`, `*.test.tsx` (except `*.browser.test.ts`)

### Browser Tests (Playwright)
Browser tests run in a real Chromium browser and provide full browser APIs:
- PDF loading and rendering
- Canvas operations
- PDF to image conversion
- PDF to Word/PowerPoint conversion
- Real Blob/File APIs

**Files:** `*.browser.test.ts`

**Note:** Browser tests require `@vitest/browser` and Playwright to be installed. On Windows, Playwright works without additional system dependencies (unlike WSL).

## Test Fixtures

The `fixtures/` directory contains test files used by the test suite:
- `test.pdf` - A multi-page PDF generated from README.md, useful for testing PDF loading, page extraction, and conversion features

To regenerate the test PDF after updating README.md:
```bash
npm run test:generate-pdf
```

## Test Structure

- `types.test.ts` - Tests for TypeScript types and enums
- `pdfService.test.ts` - Unit tests for PDF service utility functions (DOM mocks)
- `pdfService.browser.test.ts` - Browser tests for PDF operations (real rendering)
- `pdfService.integration.test.ts` - Integration tests with error handling
- `App.test.tsx` - Component tests for the main App component
- `fixtures/test.pdf` - Test PDF file generated from README.md for integration testing

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
