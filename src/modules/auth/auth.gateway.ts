import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { cors } from 'src/const/cors';
import { AuthService } from 'src/modules/auth/auth.service';

@WebSocketGateway({ cors, namespace: 'users' })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const user = await this.authService.getUserFromSocket(client);
    console.log(
      'user connected',
      user.displayName,
      client.id,
      client.rooms.size,
    );
    client.join(user.id);
  }

  handleDisconnect(client: Socket) {
    console.log('user disconnected', client.id);
  }
}
