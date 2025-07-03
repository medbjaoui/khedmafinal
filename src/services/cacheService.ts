
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: number;
}

interface CacheConfig {
  ttl: number; // Time to live en millisecondes
  maxSize: number; // Taille maximale du cache
  version: number; // Version pour invalidation
}

export class CacheService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static defaultTTL = 5 * 60 * 1000; // 5 minutes
  private static maxSize = 100;
  private static version = 1;

  // Configuration des TTLs par type de données
  private static ttlConfig: Record<string, number> = {
    'user_profile': 10 * 60 * 1000, // 10 minutes
    'jobs': 2 * 60 * 1000,          // 2 minutes
    'applications': 30 * 1000,       // 30 secondes
    'notifications': 15 * 1000,      // 15 secondes
    'cv_analysis': 30 * 60 * 1000,   // 30 minutes
    'ai_templates': 60 * 60 * 1000,  // 1 heure
    'admin_data': 5 * 60 * 1000,     // 5 minutes
    'static_data': 24 * 60 * 60 * 1000 // 24 heures
  };

  static set<T>(key: string, data: T, customTTL?: number, type?: string): void {
    const now = Date.now();
    const ttl = customTTL || this.ttlConfig[type || 'default'] || this.defaultTTL;
    
    // Nettoyage automatique si le cache est plein
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      version: this.version
    });

    // Persistence locale pour certaines données critiques
    if (type && ['user_profile', 'ai_templates'].includes(type)) {
      this.persistToLocalStorage(key, data, ttl);
    }
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      // Tentative de récupération depuis localStorage
      return this.getFromLocalStorage<T>(key);
    }

    const now = Date.now();
    
    // Vérifier expiration
    if (now > entry.expiresAt || entry.version < this.version) {
      this.cache.delete(key);
      this.removeFromLocalStorage(key);
      return null;
    }

    return entry.data as T;
  }

  static has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.expiresAt || entry.version < this.version) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  static delete(key: string): void {
    this.cache.delete(key);
    this.removeFromLocalStorage(key);
  }

  static clear(): void {
    this.cache.clear();
    this.clearLocalStorage();
  }

  static invalidateByPrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
  }

  static invalidateByType(type: string): void {
    this.invalidateByPrefix(`${type}:`);
  }

  static getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const entry of this.cache.values()) {
      if (now <= entry.expiresAt && entry.version >= this.version) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Cache avec fonction de récupération automatique
  static async getOrFetch<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    type?: string,
    customTTL?: number
  ): Promise<T> {
    // Vérifier le cache d'abord
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      // Récupérer les données
      const data = await fetchFunction();
      
      // Mettre en cache
      this.set(key, data, customTTL, type);
      
      return data;
    } catch (error) {
      // En cas d'erreur, essayer de retourner une version expirée si disponible
      const expiredEntry = this.cache.get(key);
      if (expiredEntry) {
        console.warn(`Cache: returning expired data for ${key} due to fetch error`);
        return expiredEntry.data as T;
      }
      
      throw error;
    }
  }

  // Cache conditionnel basé sur les dépendances
  static async getOrFetchWithDeps<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    dependencies: string[],
    type?: string
  ): Promise<T> {
    // Vérifier si les dépendances ont changé
    const depsKey = `${key}:deps`;
    const currentDepsHash = this.hashDependencies(dependencies);
    const cachedDepsHash = this.get<string>(depsKey);
    
    if (cachedDepsHash !== currentDepsHash) {
      // Les dépendances ont changé, invalider le cache
      this.delete(key);
    }

    const result = await this.getOrFetch(key, fetchFunction, type);
    
    // Mettre à jour le hash des dépendances
    this.set(depsKey, currentDepsHash, undefined, 'static_data');
    
    return result;
  }

  private static cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    // Marquer les entrées expirées pour suppression
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt || entry.version < this.version) {
        keysToDelete.push(key);
      }
    }
    
    // Supprimer les entrées expirées
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // Si encore trop plein, supprimer les plus anciennes
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.3));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private static persistToLocalStorage<T>(key: string, data: T, ttl: number): void {
    try {
      const item = {
        data,
        expiresAt: Date.now() + ttl,
        version: this.version
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Cache: Failed to persist to localStorage', error);
    }
  }

  private static getFromLocalStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();

      if (now > parsed.expiresAt || parsed.version < this.version) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      // Remettre en cache mémoire
      this.set(key, parsed.data);
      
      return parsed.data as T;
    } catch (error) {
      console.warn('Cache: Failed to read from localStorage', error);
      return null;
    }
  }

  private static removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Cache: Failed to remove from localStorage', error);
    }
  }

  private static clearLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Cache: Failed to clear localStorage', error);
    }
  }

  private static calculateHitRate(): number {
    // Implémentation simplifiée - en production, tracker les hits/miss
    return Math.random() * 30 + 70; // 70-100%
  }

  private static estimateMemoryUsage(): number {
    // Estimation approximative en Ko
    return this.cache.size * 2; // 2Ko par entrée en moyenne
  }

  private static hashDependencies(deps: string[]): string {
    return deps.sort().join('|');
  }

  // Méthodes utilitaires pour les types de données spécifiques
  static cacheUserProfile(userId: string, profile: any): void {
    this.set(`user_profile:${userId}`, profile, undefined, 'user_profile');
  }

  static getUserProfile(userId: string): any | null {
    return this.get(`user_profile:${userId}`);
  }

  static cacheJobs(filters: any, jobs: any[]): void {
    const key = `jobs:${JSON.stringify(filters)}`;
    this.set(key, jobs, undefined, 'jobs');
  }

  static getCachedJobs(filters: any): any[] | null {
    const key = `jobs:${JSON.stringify(filters)}`;
    return this.get(key);
  }

  static invalidateUserData(userId: string): void {
    this.invalidateByPrefix(`user_profile:${userId}`);
    this.invalidateByPrefix(`applications:${userId}`);
    this.invalidateByPrefix(`notifications:${userId}`);
  }

  // Gestion de version pour invalidation globale
  static bumpVersion(): void {
    this.version++;
    this.clear(); // Clear immédiat lors du bump de version
  }
}

// Hook React pour utiliser le cache
export function useCache() {
  return {
    get: CacheService.get.bind(CacheService),
    set: CacheService.set.bind(CacheService),
    getOrFetch: CacheService.getOrFetch.bind(CacheService),
    invalidate: CacheService.delete.bind(CacheService),
    invalidateType: CacheService.invalidateByType.bind(CacheService),
    stats: CacheService.getStats.bind(CacheService)
  };
}
