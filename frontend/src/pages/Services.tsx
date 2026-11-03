import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Clock, Tag, User, Search, RefreshCw } from 'lucide-react';
import ChatModal from '../components/ChatModal'; // <-- Import Modal

export default function Services() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // State for the Chat Modal
  const [chatTarget, setChatTarget] = useState<{ id: string; name: string; title: string } | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await api.get('/services')).data
  });

  const hireMutation = useMutation({
    mutationFn: (serviceId: string) => api.post(`/orders/${serviceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setToastMessage('Successfully hired! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1500);
    },
    onError: (err: any) => {
      setToastMessage(err.response?.data?.message || 'Failed to hire.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  });

  const filteredServices = services?.filter((service: any) => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Loading gigs...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 relative">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down font-medium">
          {toastMessage}
        </div>
      )}

      {/* --- CHAT MODAL --- */}
      <ChatModal 
        isOpen={!!chatTarget}
        onClose={() => setChatTarget(null)}
        otherUserId={chatTarget?.id || ''}
        otherUserName={chatTarget?.name || 'Freelancer'}
        itemTitle={chatTarget?.title || ''}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
              <Briefcase className="text-emerald-600 w-10 h-10" /> Hire a Freelancer
            </h1>
            <p className="text-gray-600 text-lg">Browse top-tier services from our community.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/courses" className="flex items-center gap-2 text-gray-600 font-medium hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              Browse Courses
            </Link>
            {user ? (
              <Link to="/dashboard" className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-sm">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-sm">
                Login to Hire
              </Link>
            )}
          </div>
        </div>

        <div className="relative mb-10 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search gigs by title, description, or category..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm transition-all bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredServices?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-lg">No gigs found matching "{searchQuery}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices?.map((service: any) => (
              <div key={service._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <User size={18} className="text-emerald-700" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {service.freelancerId?.firstName || 'Freelancer'} {service.freelancerId?.lastName || ''}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{service.title}</h2>
                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{service.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                      <Tag size={12} /> {service.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      <Clock size={12} /> {service.deliveryDays} Days Delivery
                    </span>
                  </div>

                  {/* BARTER BADGE */}
                  {service.allowExchange && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                      <p className="text-sm font-bold text-emerald-800 flex items-center gap-1">
                        <RefreshCw size={14} /> Open to Skill Exchange
                      </p>
                      {service.skillsWanted && (
                        <p className="text-xs text-emerald-600 mt-1">Wants to learn: {service.skillsWanted}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-auto border-t border-gray-100 pt-4">
                  <p className="text-2xl font-extrabold text-emerald-600 mb-4">${service.price}</p>
                  
                  {!user && (
                    <Link to="/login" className="block text-center w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                      Login to Hire
                    </Link>
                  )}

                  {user?.role === 'student' && (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => hireMutation.mutate(service._id)}
                        disabled={hireMutation.isPending}
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {hireMutation.isPending ? 'Hiring...' : 'Hire Now'}
                      </button>
                      
                      {/* BARTER BUTTON -> OPENS MODAL */}
                      {service.allowExchange && (
                        <button 
                          onClick={() => setChatTarget({ 
                            id: service.freelancerId?._id || service.freelancerId, 
                            name: service.freelancerId?.firstName || 'Freelancer',
                            title: service.title
                          })}
                          className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-sm"
                        >
                          Offer Exchange
                        </button>
                      )}
                    </div>
                  )}

                  {user && user.role !== 'student' && (
                    <div className="text-sm text-center font-medium text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      Only students can hire
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}