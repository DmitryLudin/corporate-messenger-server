import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Res,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { RegisterDto } from 'src/modules/auth/dto';
import {
  JwtAuthGuard,
  JwtRefreshGuard,
  LocalAuthGuard,
} from 'src/modules/auth/guards';
import { RequestWithUser } from 'src/modules/auth/types';
import { UsersService } from 'src/modules/users/users.service';
import { AuthService } from 'src/modules/auth/auth.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authenticationService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('sign-up')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser, @Res() response: FastifyReply) {
    const { user } = request;
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(user.id);
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authenticationService.getCookieWithJwtRefreshToken(user.id);

    await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

    response.header('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('log-out')
  @HttpCode(200)
  async logOut(@Req() request: RequestWithUser, @Res() response: FastifyReply) {
    await this.usersService.removeRefreshToken(request.user.id);
    response.header(
      'Set-Cookie',
      this.authenticationService.getCookiesForLogOut(),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    return request.user;
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser, @Res() response: FastifyReply) {
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(request.user.id);

    response.header('Set-Cookie', accessTokenCookie);
    return request.user;
  }
}
