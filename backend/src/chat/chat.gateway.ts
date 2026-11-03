import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Maps a userId to their active socket connection ID
  private activeUsers = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.activeUsers.set(userId, client.id);
    //   console.log(`User ${userId} connected via WebSocket`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.activeUsers.delete(userId);
    //   console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: string; receiverId: string; content: string },
  ) {
    // 1. Save message to database
    const savedMessage = await this.chatService.sendMessage(
      data.senderId,
      data.receiverId,
      data.content,
    );

    // 2. Send to receiver if they are online
    const receiverSocketId = this.activeUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', savedMessage);
    }

    // 3. Send back to sender for instant UI update
    const senderSocketId = this.activeUsers.get(data.senderId);
    if (senderSocketId) {
      this.server.to(senderSocketId).emit('newMessage', savedMessage);
    }

    return savedMessage;
  }
}