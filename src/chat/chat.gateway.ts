import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { IChat } from './interfaces/chat.interface';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this to your specific frontend domain in production
  },
  transports: ['websocket'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  private connectedClients = {};

  afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    try {
      console.log(`Client connected ${client.id}, ${client.handshake.query['userId']}`);
      this.connectedClients[client.handshake.query['userId'].toString()] = client.id;
    } catch (error) {
      console.error('Error in handleConnection', error);
    }
  }

  handleDisconnect(client: Socket) {
    try {
      console.log(`Client disconnected: ${client.id}, ${client.handshake.query['userId'].toString()}`);
      delete this.connectedClients[client.handshake.query['userId'].toString()];
    } catch (error) {
      console.error('Error in handleDisconnect', error);
    }
  }

  // @SubscribeMessage('joinRoom')
  // async handleJoinRoom(client: Socket, roomId: string) {
  //   client.join(roomId);
  //   console.log(`Client ${client.id} joined room ${roomId}`);
  // }

  // Method to send a message programmatically
  async sendMessageToRoom(userId: string, message: IChat) {
    const socketId = this.connectedClients[userId];
    console.log('Emiting on ', socketId, userId);
    this.server.to(socketId).emit('newMessage', message);
  }
}
