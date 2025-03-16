// tests/setup.ts
import { vi } from 'vitest';

// Mock pour requestAnimationFrame si nécessaire
global.requestAnimationFrame = vi.fn(callback => {
   setTimeout(callback, 0);
   return 0;
}) as unknown as (callback: FrameRequestCallback) => number;
global.cancelAnimationFrame = vi.fn();

Object.defineProperty(window, 'matchMedia', {
   writable: true,
   value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
   })),
});