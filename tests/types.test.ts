import { describe, it, expect } from 'vitest';
import { ExportFormat } from '../types';

describe('ExportFormat Enum', () => {
  it('should have correct export format values', () => {
    expect(ExportFormat.PDF).toBe('PDF');
    expect(ExportFormat.IMAGE).toBe('IMAGE');
    expect(ExportFormat.WORD).toBe('WORD');
    expect(ExportFormat.PPTX).toBe('PPTX');
  });

  it('should have all expected format types', () => {
    const formats = Object.values(ExportFormat);
    expect(formats).toContain('PDF');
    expect(formats).toContain('IMAGE');
    expect(formats).toContain('WORD');
    expect(formats).toContain('PPTX');
    expect(formats.length).toBe(4);
  });
});
