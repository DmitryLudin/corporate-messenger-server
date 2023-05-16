import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-streams-adapter';
import { ServerOptions } from 'socket.io';
import { createClient } from 'redis';
import * as eiows from 'eiows';

type TConnectRedisOptions = {
  host: string;
  port: string;
};

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis({ host, port }: TConnectRedisOptions): Promise<void> {
    const redisClient = createClient({ url: `redis://${host}:${port}` });
    await redisClient.connect();
    this.adapterConstructor = createAdapter(redisClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      wsEngine: eiows.Server,
    });
    server.adapter(this.adapterConstructor);
    return server;
  }
}
