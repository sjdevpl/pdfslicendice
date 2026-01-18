import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Check if we're in browser mode (browser tests have native APIs)
const isBrowserMode = typeof window !== 'undefined' && 
  typeof (window as any).DOMMatrix !== 'undefined' &&
  typeof (window as any).DOMMatrix === 'function';

// Mock DOMMatrix for pdfjs-dist in jsdom environment only
// Browser mode has native DOMMatrix support
if (!isBrowserMode && typeof global !== 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    a: number; b: number; c: number; d: number; e: number; f: number;
    is2D: boolean; isIdentity: boolean;

    constructor(_init?: string | number[] | any) {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      this.is2D = true; this.isIdentity = true;
    }

    static fromMatrix(_other?: any): DOMMatrix { return new DOMMatrix(); }
    private _clone(): DOMMatrix {
      const m = new DOMMatrix();
      m.a = this.a; m.b = this.b; m.c = this.c; m.d = this.d; m.e = this.e; m.f = this.f;
      m.is2D = this.is2D; m.isIdentity = this.isIdentity;
      return m;
    }
    translate(tx: number = 0, ty: number = 0): DOMMatrix {
      const m = this._clone(); m.e += tx; m.f += ty;
      m.isIdentity = m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0;
      return m;
    }
    scale(scaleX: number = 1, scaleY: number = scaleX): DOMMatrix {
      const m = this._clone(); m.a *= scaleX; m.d *= scaleY;
      m.isIdentity = m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0;
      return m;
    }
    multiply(other: any): DOMMatrix {
      const o = other as DOMMatrix;
      const m = new DOMMatrix();
      m.a = this.a * o.a + this.c * o.b;
      m.b = this.b * o.a + this.d * o.b;
      m.c = this.a * o.c + this.c * o.d;
      m.d = this.b * o.c + this.d * o.d;
      m.e = this.a * o.e + this.c * o.f + this.e;
      m.f = this.b * o.e + this.d * o.f + this.f;
      m.is2D = this.is2D && o.is2D;
      m.isIdentity = m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0;
      return m;
    }
    clone(): DOMMatrix { return this._clone(); }
    toFloat32Array(): Float32Array {
      return new Float32Array([this.a, this.b, this.c, this.d, this.e, this.f]);
    }
  } as any;
}

// Note: PDF.js worker is configured in pdfService.ts
// The "legacy build" warning is expected and harmless in test environments

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_GEMINI_API_KEY: 'test-api-key',
  },
}));

// Mock URL.createObjectURL and URL.revokeObjectURL only in jsdom
// Browser mode has native implementations
if (!isBrowserMode && typeof global !== 'undefined') {
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();
}
