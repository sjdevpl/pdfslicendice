import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * E2E tests for PDF service functions using real browser APIs
 * These tests run in a real browser, so Canvas API works properly
 */
test.describe('PDF Service - E2E Tests', () => {
  test('should load PDF and extract pages with thumbnails', async ({ page }) => {
    // Load test PDF
    const pdfPath = join(process.cwd(), 'tests', 'fixtures', 'test.pdf');
    const pdfBuffer = readFileSync(pdfPath);
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    
    // Create a data URL from the PDF
    const pdfDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(pdfBlob);
    });

    // Inject PDF service functions into the page
    await page.addScriptTag({ path: 'dist/assets/index.js' }).catch(() => {
      // If built files don't exist, we'll test via the app UI instead
    });

    // Test PDF.js directly in browser context
    await page.evaluate(async (pdfData) => {
      // Remove data URL prefix to get base64
      const base64 = pdfData.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Load PDF using PDF.js
      const pdfjs = (window as any).pdfjsLib;
      if (!pdfjs) {
        throw new Error('PDF.js not loaded');
      }

      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      
      expect(pdf.numPages).toBeGreaterThan(0);
      
      // Render first page to canvas
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      await page.render({ canvasContext: context, viewport }).promise;
      const thumbnail = canvas.toDataURL('image/png');
      
      expect(thumbnail).toMatch(/^data:image\/png;base64,/);
      expect(thumbnail.length).toBeGreaterThan(100);
    }, pdfDataUrl);
  });
});
