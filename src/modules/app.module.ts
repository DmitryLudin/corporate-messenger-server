import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configSchema } from 'src/const/config.schema';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ChannelsModule } from 'src/modules/channels/channels.module';
import { DatabaseModule } from 'src/modules/database/database.module';
import { UsersModule } from 'src/modules/users/users.module';
import { GlobalCacheModule } from './global-cache/global-cache.module';
import { NamespacesModule } from './namespaces/namespaces.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configSchema,
    }),
    AuthModule,
    DatabaseModule,
    UsersModule,
    ChannelsModule,
    GlobalCacheModule,
    NamespacesModule,
  ],
})
export class AppModule {}
