import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { cors } from 'src/const/cors';
import { AuthService } from 'src/modules/auth/auth.service';

@WebSocketGateway({ cors, namespace: 'users' })
export class AuthGateway implements OnGatewayConnection {
  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const user = await this.authService.getUserFromSocket(client);
    client.join(user.id);
  }
}
