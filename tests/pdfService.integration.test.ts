import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { loadPdf } from '../services/pdfService';

/**
 * Integration tests for PDF service functions using real PDF files
 * 
 * NOTE: These tests require Canvas API which doesn't work well in jsdom.
 * For full E2E testing with real browser APIs, use Playwright tests in tests/e2e/
 * 
 * These tests are kept for basic validation but may have limitations.
 */
describe('pdfService - Integration Tests (Limited)', () => {
  let testPdfFile: File;

  beforeAll(() => {
    // Load the test PDF file
    const pdfPath = join(process.cwd(), 'tests', 'fixtures', 'test.pdf');
    const pdfBuffer = readFileSync(pdfPath);
    
    // Create a fresh ArrayBuffer copy (not shared)
    const uint8Array = new Uint8Array(pdfBuffer.length);
    uint8Array.set(pdfBuffer);
    const arrayBuffer = uint8Array.buffer;
    
    testPdfFile = new File([uint8Array], 'test.pdf', { type: 'application/pdf' });
    
    // jsdom's File doesn't have arrayBuffer() - polyfill it
    Object.defineProperty(testPdfFile, 'arrayBuffer', {
      value: async function() {
        return arrayBuffer;
      },
      writable: false,
      configurable: true,
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid PDF file gracefully', async () => {
      const invalidFile = new File(['not a pdf'], 'invalid.pdf', { type: 'application/pdf' });
      await expect(loadPdf(invalidFile)).rejects.toThrow();
    }, 10000);

    it('should handle empty file', async () => {
      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
      await expect(loadPdf(emptyFile)).rejects.toThrow();
    }, 10000);
  });

  // Note: Full rendering tests (loadPdf, convertToImage, etc.) are in tests/e2e/
  // because they require real browser Canvas API which jsdom doesn't support well
});
