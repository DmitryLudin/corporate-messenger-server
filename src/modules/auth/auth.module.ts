import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import {
  JwtAuthGuard,
  JwtRefreshGuard,
  LocalAuthGuard,
} from 'src/modules/auth/guards';
import {
  JwtRefreshTokenStrategy,
  JwtStrategy,
  LocalStrategy,
} from 'src/modules/auth/strategies';
import { UsersModule } from 'src/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthGateway } from './auth.gateway';

@Module({
  imports: [UsersModule, PassportModule, ConfigModule, JwtModule.register({})],
  providers: [
    AuthService,
    LocalStrategy,
    LocalAuthGuard,
    JwtStrategy,
    JwtAuthGuard,
    JwtRefreshTokenStrategy,
    JwtRefreshGuard,
    AuthGateway,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
