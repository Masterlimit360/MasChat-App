import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reel } from './reelService';

interface CachedReel extends Reel {
  cachedAt: number;
  lastAccessed: number;
}

class ReelCacheService {
  private cacheKey = 'maschat_reels_cache';
  private maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  private maxCachedReels = 100;

  async cacheReels(reels: Reel[]): Promise<void> {
    try {
      const existingCache = await this.getCachedReels();
      const now = Date.now();
      
      const updatedCache: CachedReel[] = reels.map(reel => {
        const existing = existingCache.find(cached => cached.id === reel.id);
        return {
          ...reel,
          cachedAt: existing?.cachedAt || now,
          lastAccessed: now,
        };
      });

      const newReelIds = new Set(reels.map(r => r.id));
      const oldReels = existingCache.filter(cached => !newReelIds.has(cached.id));
      const allCachedReels = [...updatedCache, ...oldReels].slice(0, this.maxCachedReels);
      
      await AsyncStorage.setItem(this.cacheKey, JSON.stringify(allCachedReels));
      console.log(`Cached ${updatedCache.length} reels, total cached: ${allCachedReels.length}`);
    } catch (error) {
      console.error('Error caching reels:', error);
    }
  }

  async getCachedReels(): Promise<Reel[]> {
    try {
      const cached = await AsyncStorage.getItem(this.cacheKey);
      if (!cached) return [];

      const cachedReels: CachedReel[] = JSON.parse(cached);
      const now = Date.now();
      
      const validReels = cachedReels.filter(reel => 
        (now - reel.cachedAt) < this.maxCacheAge
      );

      const updatedReels = validReels.map(reel => ({
        ...reel,
        lastAccessed: now,
      }));

      if (validReels.length !== cachedReels.length) {
        await AsyncStorage.setItem(this.cacheKey, JSON.stringify(updatedReels));
      }

      return updatedReels;
    } catch (error) {
      console.error('Error getting cached reels:', error);
      return [];
    }
  }

  async isCacheFresh(maxAgeMinutes: number = 30): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(this.cacheKey);
      if (!cached) return false;
      
      const cachedReels: CachedReel[] = JSON.parse(cached);
      if (cachedReels.length === 0) return false;
      
      const now = Date.now();
      const maxAge = maxAgeMinutes * 60 * 1000;
      const oldestCache = Math.min(...cachedReels.map(r => r.cachedAt));
      
      return (now - oldestCache) < maxAge;
    } catch (error) {
      console.error('Error checking cache freshness:', error);
      return false;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.cacheKey);
      console.log('Reel cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default new ReelCacheService(); 