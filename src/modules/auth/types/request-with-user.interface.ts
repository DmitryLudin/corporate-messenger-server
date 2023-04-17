import { FastifyRequest } from 'fastify';
import { User } from 'src/modules/users/user.entity';

export interface RequestWithUser extends FastifyRequest {
  user: User;
}
