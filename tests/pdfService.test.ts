import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadBlob } from '../services/pdfService';

describe('pdfService - downloadBlob', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup DOM mocks
    document.body.innerHTML = '';
  });

  it('should create download link and trigger download', () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
    const filename = 'test.pdf';
    
    // Mock document methods
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    
    downloadBlob(mockBlob, filename);
    
    // Verify createElement was called to create an anchor
    expect(createElementSpy).toHaveBeenCalledWith('a');
    
    // Verify the link was appended and removed
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('should set correct href and download attributes', () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
    const filename = 'document.pdf';
    
    let capturedAnchor: HTMLAnchorElement | null = null;
    const originalAppendChild = document.body.appendChild;

    try {
      document.body.appendChild = vi.fn((node) => {
        capturedAnchor = node as HTMLAnchorElement;
        return originalAppendChild.call(document.body, node);
      });
      
      downloadBlob(mockBlob, filename);
      
      expect(capturedAnchor).not.toBeNull();
      expect(capturedAnchor?.download).toBe(filename);
      expect(capturedAnchor?.href).toContain('mock-url');
    } finally {
      document.body.appendChild = originalAppendChild;
    }
  });

  it('should revoke object URL after download', () => {
    const mockBlob = new Blob(['test content'], { type: 'text/plain' });
    const filename = 'test.txt';
    
    downloadBlob(mockBlob, filename);
    
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });
});
