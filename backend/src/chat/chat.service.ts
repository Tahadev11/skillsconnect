import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
    constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) { }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    const sender = new Types.ObjectId(senderId);
    const receiver = new Types.ObjectId(receiverId);

    // 1. Check if there are ANY accepted messages between these two users
    const existingAcceptedMessage = await this.messageModel.findOne({
      $or: [
        { senderId: sender, receiverId: receiver },
        { senderId: receiver, receiverId: sender }
      ],
      status: 'accepted'
    });

    // 2. If they have already accepted the chat, keep it 'accepted'. 
    // Otherwise, it remains a 'pending' request.
    const status = existingAcceptedMessage ? 'accepted' : 'pending';

    // 3. Create the message with the correct status
    return this.messageModel.create({
      senderId: sender,
      receiverId: receiver,
      content,
      status: status,
    });
  }
    async getConversation(user1Id: string, user2Id: string) {
        return this.messageModel.find({
            $or: [
                { senderId: new Types.ObjectId(user1Id), receiverId: new Types.ObjectId(user2Id) },
                { senderId: new Types.ObjectId(user2Id), receiverId: new Types.ObjectId(user1Id) },
            ],
        }).sort({ createdAt: 1 }).exec();
    }

    async getMyChats(userId: string) {
        const myObjectId = new Types.ObjectId(userId);

        const messages = await this.messageModel.find({
            $or: [{ senderId: myObjectId }, { receiverId: myObjectId }]
        }).populate('senderId', 'firstName lastName email').populate('receiverId', 'firstName lastName email').sort({ createdAt: -1 }).exec();

        const chatMap = new Map();
        messages.forEach((msg: any) => {
            const isSender = msg.senderId._id.toString() === userId;
            const otherUser = isSender ? msg.receiverId : msg.senderId;

            if (otherUser && !chatMap.has(otherUser._id.toString())) {
                chatMap.set(otherUser._id.toString(), {
                    userId: otherUser._id,
                    firstName: otherUser.firstName,
                    lastName: otherUser.lastName,
                    email: otherUser.email,
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    status: msg.status, // <-- Include status
                    isSender: isSender // <-- Know who started the chat
                });
            }
        });

        return Array.from(chatMap.values()).sort((a, b) =>
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
    }

    async acceptRequest(userId: string, otherUserId: string) {
        const myId = new Types.ObjectId(userId);
        const otherId = new Types.ObjectId(otherUserId);

        // Update all messages between these two users to 'accepted'
        await this.messageModel.updateMany(
            {
                $or: [
                    { senderId: myId, receiverId: otherId },
                    { senderId: otherId, receiverId: myId }
                ]
            },
            { status: 'accepted' }
        );

        return { success: true };
    }

      async deleteConversation(userId: string, otherUserId: string) {
    const myId = new Types.ObjectId(userId);
    const otherId = new Types.ObjectId(otherUserId);

    // Delete all messages between these two users
    return this.messageModel.deleteMany({
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId }
      ]
    });
  }
}