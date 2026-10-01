// Minimal in-memory Web Storage stub so zustand's `persist` middleware (which
// defaults to createJSONStorage(() => localStorage)) has somewhere to write in
// a node test environment. Installed unconditionally (Node 25 ships its own
// experimental global localStorage that needs --localstorage-file; we don't
// want tests depending on that).
//
// This runs as a Vitest setupFile, i.e. before any test module (and so before
// src/engine/store.ts) is imported.

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
  writable: true,
});

// zustand 5's persist defaults to createJSONStorage(() => window.localStorage),
// so without a `window` the middleware silently disables itself in node.
if (typeof (globalThis as { window?: unknown }).window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: {
      get localStorage() {
        return globalThis.localStorage;
      },
    },
    configurable: true,
    writable: true,
  });
}
