import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configSchema } from 'src/const/config.schema';
import { AuthModule } from 'src/modules/auth/auth.module';
import { DatabaseModule } from 'src/modules/database/database.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configSchema,
    }),
    AuthModule,
    DatabaseModule,
    UsersModule,
  ],
})
export class AppModule {}
