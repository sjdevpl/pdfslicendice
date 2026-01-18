import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { loadPdf, convertToImage, convertToWord, convertToPptx } from '../services/pdfService';

/**
 * Browser tests for PDF service functions
 * These tests run in a real browser environment using Vitest browser mode
 * This provides proper Canvas API support for PDF rendering
 */
describe('pdfService - Browser Tests', () => {
  let testPdfFile: File;
  let testPdfBlob: Blob;

  beforeAll(async () => {
    // Load the test PDF file
    const pdfPath = join(process.cwd(), 'tests', 'fixtures', 'test.pdf');
    const pdfBuffer = readFileSync(pdfPath);
    
    // Create a fresh ArrayBuffer copy
    const uint8Array = new Uint8Array(pdfBuffer.length);
    uint8Array.set(pdfBuffer);
    
    testPdfFile = new File([uint8Array], 'test.pdf', { type: 'application/pdf' });
    testPdfBlob = new Blob([uint8Array], { type: 'application/pdf' });
  });

  describe('loadPdf', () => {
    it('should load PDF and extract pages with thumbnails', async () => {
      const pages = await loadPdf(testPdfFile);
      
      expect(pages).toBeDefined();
      expect(Array.isArray(pages)).toBe(true);
      expect(pages.length).toBeGreaterThan(0);
      
      // Verify page structure
      const firstPage = pages[0];
      expect(firstPage).toHaveProperty('index');
      expect(firstPage).toHaveProperty('thumbnail');
      expect(firstPage).toHaveProperty('blob');
      expect(firstPage).toHaveProperty('width');
      expect(firstPage).toHaveProperty('height');
      
      // Verify thumbnail is a data URL
      expect(firstPage.thumbnail).toMatch(/^data:image\/png;base64,/);
      expect(firstPage.thumbnail.length).toBeGreaterThan(100);
      
      // Verify blob is a PDF
      expect(firstPage.blob).toBeInstanceOf(Blob);
      expect(firstPage.blob.type).toBe('application/pdf');
      expect(firstPage.blob.size).toBeGreaterThan(0);
      
      // Verify dimensions
      expect(firstPage.width).toBeGreaterThan(0);
      expect(firstPage.height).toBeGreaterThan(0);
    }, 30000);

    it('should extract all pages from multi-page PDF', async () => {
      const pages = await loadPdf(testPdfFile);
      
      // Verify each page has correct index
      pages.forEach((page, index) => {
        expect(page.index).toBe(index);
        expect(page.thumbnail).toBeTruthy();
        expect(page.blob).toBeInstanceOf(Blob);
      });
    }, 30000);
  });

  describe('convertToImage', () => {
    it('should convert PDF blob to PNG image data URL', async () => {
      const imageData = await convertToImage(testPdfBlob);
      
      expect(imageData).toBeDefined();
      expect(typeof imageData).toBe('string');
      expect(imageData).toMatch(/^data:image\/png;base64,/);
      expect(imageData.length).toBeGreaterThan(1000); // Should have substantial base64 data
    }, 30000);

    it('should produce valid base64 image data', async () => {
      const imageData = await convertToImage(testPdfBlob);
      
      // Extract base64 part
      const base64Data = imageData.split(',')[1];
      expect(base64Data).toBeTruthy();
      
      // Verify it's valid base64
      expect(() => {
        atob(base64Data);
      }).not.toThrow();
    }, 30000);
  });

  describe('convertToWord', () => {
    it('should convert image to Word document blob', async () => {
      // First convert PDF to image
      const imageData = await convertToImage(testPdfBlob);
      
      // Then convert image to Word
      const wordBlob = await convertToWord(imageData);
      
      expect(wordBlob).toBeInstanceOf(Blob);
      expect(wordBlob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(wordBlob.size).toBeGreaterThan(0);
    }, 30000);
  });

  describe('convertToPptx', () => {
    it('should convert image to PowerPoint blob', async () => {
      // First convert PDF to image
      const imageData = await convertToImage(testPdfBlob);
      
      // Then convert image to PowerPoint
      const pptxBlob = await convertToPptx(imageData);
      
      expect(pptxBlob).toBeInstanceOf(Blob);
      expect(pptxBlob.type).toBe('application/vnd.openxmlformats-officedocument.presentationml.presentation');
      expect(pptxBlob.size).toBeGreaterThan(0);
    }, 30000);
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

    it('should handle invalid blob for image conversion', async () => {
      const invalidBlob = new Blob(['not a pdf'], { type: 'application/pdf' });
      await expect(convertToImage(invalidBlob)).rejects.toThrow();
    }, 10000);
  });
});
