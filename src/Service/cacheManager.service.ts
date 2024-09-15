import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Profile } from 'src/Model/profileUser.model';

@Injectable()
export class CacheManagerService implements OnModuleInit {
  private readonly defaultProfiles: Profile[] = [
    { id: 1, code: 'ADMIN', name: 'Administrator' },
    { id: 2, code: 'USER', name: 'Regular User' },
  ];

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onModuleInit() {
    try {
      await this.loadDefaultProfiles();
      console.log('Cache initialized successfully.');
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  public async loadDefaultProfiles() {
    try {
      /** Verifica si los perfiles ya están en el caché */
      const profiles = await this.get<Profile[]>('defaultProfiles');
      if (!profiles) {
        /** Si no están, los guarda en el caché */
        await this.set('defaultProfiles', this.defaultProfiles, 360000);
        console.log('Default profiles have been loaded into the cache.');
      } else {
        console.log('Default profiles are already in the cache.');
      }
    } catch (error) {
      throw new Error('Failed to load default profiles');
    }
  }
}
