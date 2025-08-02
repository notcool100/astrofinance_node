import NodeCache from 'node-cache';
import logger from '../../config/logger';

// Create cache instances with TTL of 5 minutes (300 seconds)
const loanTypeCache = new NodeCache({ stdTTL: 300 });
const calculatorCache = new NodeCache({ stdTTL: 300 });
const userCache = new NodeCache({ stdTTL: 300 });

/**
 * Get data from cache or fetch it using the provided function
 * @param cache Cache instance
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @returns Cached or freshly fetched data
 */
export const getOrFetch = async <T>(
  cache: NodeCache,
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  // Try to get from cache first
  const cachedData = cache.get<T>(key);
  if (cachedData !== undefined) {
    logger.debug(`Cache hit for key: ${key}`);
    return cachedData;
  }

  // If not in cache, fetch from source
  logger.debug(`Cache miss for key: ${key}, fetching data...`);
  const data = await fetchFn();
  
  // Store in cache
  cache.set(key, data);
  return data;
};

/**
 * Invalidate specific cache key
 * @param cache Cache instance
 * @param key Cache key to invalidate
 */
export const invalidateCache = (cache: NodeCache, key: string): void => {
  logger.debug(`Invalidating cache for key: ${key}`);
  cache.del(key);
};

/**
 * Invalidate all keys in a cache
 * @param cache Cache instance
 */
export const invalidateAllCache = (cache: NodeCache): void => {
  logger.debug('Invalidating all cache keys');
  cache.flushAll();
};

// Export cache instances
export const caches = {
  loanType: loanTypeCache,
  calculator: calculatorCache,
  user: userCache
};

export default {
  getOrFetch,
  invalidateCache,
  invalidateAllCache,
  caches
};