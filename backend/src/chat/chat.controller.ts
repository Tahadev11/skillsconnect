import { Controller, Get, Post, Body, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('send/:receiverId')
    send(@Param('receiverId') receiverId: string, @Body('content') content: string, @Req() req: any) {
        return this.chatService.sendMessage(req.user.userId, receiverId, content);
    }

    // --- ADDED: Accept Request Route ---
    @Post('accept/:otherUserId')
    accept(@Param('otherUserId') otherUserId: string, @Req() req: any) {
        return this.chatService.acceptRequest(req.user.userId, otherUserId);
    }

    // --- Deleted: Delete Request Route ---
    @Delete(':otherUserId')
    deleteChat(@Param('otherUserId') otherUserId: string, @Req() req: any) {
        return this.chatService.deleteConversation(req.user.userId, otherUserId);
    }

    // --- IMPORTANT: Keep this BEFORE the ':otherUserId' route ---
    @Get('my/chats')
    getMyChats(@Req() req: any) {
        return this.chatService.getMyChats(req.user.userId);
    }

    @Get(':otherUserId')
    getChat(@Param('otherUserId') otherUserId: string, @Req() req: any) {
        return this.chatService.getConversation(req.user.userId, otherUserId);
    }
}