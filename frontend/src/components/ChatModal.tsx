import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, Send, RefreshCw } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  otherUserId: string;
  otherUserName: string;
  itemTitle: string;
}

export default function ChatModal({ isOpen, onClose, otherUserId, otherUserName, itemTitle }: ChatModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages (Polls every 3 seconds for new messages)
  const { data: messages, isLoading } = useQuery({
    queryKey: ['chat', otherUserId],
    queryFn: async () => (await api.get(`/chat/${otherUserId}`)).data,
    enabled: isOpen && !!otherUserId,
    refetchInterval: 3000, 
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.post(`/chat/send/${otherUserId}`, { content }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat', otherUserId] });
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) sendMutation.mutate(message);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col h-[600px] max-h-[85vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw size={18} className="text-purple-600" />
              Skill Exchange
            </h3>
            <p className="text-sm text-gray-500 truncate max-w-[300px]">
              with {otherUserName} about "{itemTitle}"
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {isLoading ? (
            <p className="text-center text-gray-500 mt-10">Loading messages...</p>
          ) : messages?.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 px-4">
              <p className="font-medium text-gray-700">Start the negotiation! 💡</p>
              <p className="text-sm mt-2">Say hello and tell them what skill you want to exchange. E.g., "Hi! I know UI Design. I'd love to learn Next.js from you. Want to swap?"</p>
            </div>
          ) : (
            messages?.map((msg: any) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className={`text-[10px] block mt-1 ${isMe ? 'text-indigo-200 text-right' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button type="submit" disabled={!message.trim() || sendMutation.isPending} className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}