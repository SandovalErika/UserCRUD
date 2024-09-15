import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersController } from './Controller/users.controller';
import { UsersService } from './Service/users.service';
import { CacheManagerService } from './Service/cacheManager.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 360000,
      max: 100,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, CacheManagerService],
})
export class AppModule {}
