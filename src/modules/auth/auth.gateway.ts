import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { wsConfig } from 'src/const/websocket';
import { AuthService } from 'src/modules/auth/auth.service';

@WebSocketGateway({ ...wsConfig, namespace: 'users' })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      console.log('user connected', user.displayName, client.id);
      client.join(user.id);
    } catch (error) {
      console.log(error);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('user disconnected', client.id);
  }
}
