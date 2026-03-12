type CacheEntry<T> = {
  expiresAt: number;
  hasValue: boolean;
  refreshPromise: Promise<T> | null;
  value: T | undefined;
};

type CacheOptions = {
  ttlMs: number;
};

const cacheEntries = new Map<string, CacheEntry<unknown>>();

export async function getCachedValue<T>(
  key: string,
  { ttlMs }: CacheOptions,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const existing = cacheEntries.get(key) as CacheEntry<T> | undefined;

  if (existing?.hasValue && existing.expiresAt > now) {
    return existing.value as T;
  }

  if (existing?.refreshPromise) {
    return existing.refreshPromise;
  }

  const nextEntry: CacheEntry<T> = existing ?? {
    expiresAt: 0,
    hasValue: false,
    refreshPromise: null,
    value: undefined,
  };

  const refreshPromise = (async () => {
    try {
      const value = await loader();

      cacheEntries.set(key, {
        expiresAt: Date.now() + ttlMs,
        hasValue: true,
        refreshPromise: null,
        value,
      });

      return value;
    } catch (error) {
      if (nextEntry.hasValue) {
        cacheEntries.set(key, {
          ...nextEntry,
          refreshPromise: null,
        });

        return nextEntry.value as T;
      }

      cacheEntries.delete(key);
      throw error;
    }
  })();

  cacheEntries.set(key, {
    ...nextEntry,
    refreshPromise,
  });

  return refreshPromise;
}
