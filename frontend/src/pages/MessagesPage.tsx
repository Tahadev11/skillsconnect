import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Search, Check, X, AlertTriangle } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeChat, setActiveChat] = useState<{ id: string; name: string; status: string } | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inbox' | 'requests'>('inbox');
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const { data: chats, isLoading: loadingChats } = useQuery({
    queryKey: ['my-chats'],
    queryFn: async () => (await api.get('/chat/my/chats')).data,
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['chat', activeChat?.id],
    queryFn: async () => (await api.get(`/chat/${activeChat?.id}`)).data,
    enabled: !!activeChat,
  });

  const acceptMutation = useMutation({
    mutationFn: (otherUserId: string) => api.post(`/chat/accept/${otherUserId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-chats'] });
      if (activeChat) {
        queryClient.invalidateQueries({ queryKey: ['chat', activeChat.id] });
        setActiveChat({ ...activeChat, status: 'accepted' });
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (otherUserId: string) => api.delete(`/chat/${otherUserId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-chats'] });
      setActiveChat(null);
      setShowDeclineConfirm(false);
    }
  });

  // ---- Socket.io Connection ----
  useEffect(() => {
    if (user?.id) {
      const socket = io('http://localhost:3001', {
        query: { userId: user.id },
      });
      socketRef.current = socket;

      socket.on('newMessage', (msg: any) => {
        // Refresh the chat window & sidebar in real time
        queryClient.invalidateQueries({ queryKey: ['chat', msg.senderId === user.id ? msg.receiverId : msg.senderId] });
        queryClient.invalidateQueries({ queryKey: ['my-chats'] });
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user?.id, queryClient]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat || !user?.id) return;

    // Send via Socket.io instead of REST API
    socketRef.current?.emit('sendMessage', {
      senderId: user.id,
      receiverId: activeChat.id,
      content: message,
    });

    setMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredChats = chats?.filter((chat: any) => {
    const matchesSearch = `${chat.firstName} ${chat.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'requests') {
      return matchesSearch && chat.status === 'pending' && !chat.isSender;
    }
    return matchesSearch && (chat.status === 'accepted' || chat.isSender);
  });

  const requestsCount = chats?.filter((c: any) => c.status === 'pending' && !c.isSender).length || 0;
  const isIncomingRequest = activeChat?.status === 'pending' && messages && messages.length > 0 && messages[0].senderId !== user?.id;

  return (
    <>
      <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in-up">
        
        {/* LEFT SIDEBAR */}
        <div className="w-80 border-r border-gray-100 flex flex-col bg-white">
          <div className="border-b border-gray-100">
            <div className="p-6 pb-2">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Messages</h2>
            </div>
            <div className="flex px-4 gap-2 mt-2">
              <button onClick={() => setActiveTab('inbox')} className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'inbox' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>Inbox</button>
              <button onClick={() => setActiveTab('requests')} className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>
                Requests
                {requestsCount > 0 && (<span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requestsCount}</span>)}
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (<div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>) : filteredChats?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No {activeTab} found.</div>
            ) : (
              filteredChats?.map((chat: any) => (
                <button key={chat.userId} onClick={() => setActiveChat({ id: chat.userId, name: `${chat.firstName} ${chat.lastName}`, status: chat.status })} className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-all flex gap-4 items-center ${activeChat?.id === chat.userId ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">{chat.firstName?.charAt(0)}{chat.lastName?.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{chat.firstName} {chat.lastName}</h4>
                    <p className={`text-sm truncate ${chat.status === 'pending' && !chat.isSender ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                      {chat.status === 'pending' && !chat.isSender ? 'Sent you a message request' : chat.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT AREA */}
        <div className="flex-1 flex flex-col bg-[#F8FAFC]">
          {activeChat ? (
            <>
              <div className="h-20 bg-white border-b border-gray-200 px-6 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">{activeChat.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{activeChat.name}</h3>
                    <p className="text-xs text-gray-500 font-medium capitalize flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Real-time
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loadingMessages ? (<div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>) : (
                  messages?.map((msg: any) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        {!isMe && (<div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs mr-3 mt-auto mb-1 shadow-sm">{activeChat.name.charAt(0)}</div>)}
                        <div className={`max-w-[65%] px-5 py-3 shadow-sm ${isMe ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm'}`}>
                          <p className="text-[15px] leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-gray-200">
                {isIncomingRequest ? (
                  <div className="flex gap-3 justify-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex-1 text-sm text-indigo-900 font-medium self-center">This user wants to exchange skills with you.</div>
                    <button onClick={() => acceptMutation.mutate(activeChat.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-1 transition-colors"><Check size={16} /> Accept</button>
                    <button onClick={() => setShowDeclineConfirm(true)} className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 flex items-center gap-1 transition-colors"><X size={16} /> Decline</button>
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="flex gap-3 items-center bg-gray-50 border border-gray-200 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." className="flex-1 bg-transparent border-none px-2 py-2 text-sm text-gray-800 outline-none" />
                    <button type="submit" disabled={!message.trim()} className={`p-3 rounded-xl transition-all ${message.trim() ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}><Send size={18} /></button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={40} className="text-indigo-200 mb-4" />
              <h2 className="text-xl font-bold text-gray-800">Your Messages</h2>
              <p className="text-gray-500">Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>

      {showDeclineConfirm && activeChat && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="text-red-600 w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Decline Request?</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to decline the request from <strong className="text-gray-800">{activeChat.name}</strong>? This will permanently delete the conversation.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeclineConfirm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => deleteMutation.mutate(activeChat.id)} disabled={deleteMutation.isPending} className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">{deleteMutation.isPending ? 'Declining...' : 'Yes, Decline'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}