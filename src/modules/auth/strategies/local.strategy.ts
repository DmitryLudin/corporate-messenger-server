import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { User } from 'src/modules/users/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    return this.authenticationService.getAuthenticatedUser(username, password);
  }
}
