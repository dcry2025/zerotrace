import { beforeAll, vi } from 'vitest';

// Mock browser APIs that might not be available in jsdom
beforeAll(() => {
  // Mock crypto.getRandomValues if not available
  if (!global.crypto) {
    global.crypto = {
      getRandomValues: (arr: any) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
      // @ts-ignore
      subtle: global.crypto?.subtle,
    };
  }

  // Mock navigator.vibrate
  if (!global.navigator.vibrate) {
    global.navigator.vibrate = vi.fn();
  }

  // Mock window.location
  if (!global.window.location) {
    Object.defineProperty(global.window, 'location', {
      value: {
        href: 'http://localhost/',
        hash: '',
      },
      writable: true,
    });
  }
});

