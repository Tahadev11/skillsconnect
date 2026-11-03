import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { Trash2, Briefcase, Search, AlertTriangle } from 'lucide-react';

export default function AdminServices() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState<any>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => (await api.get('/services/admin/all')).data
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setServiceToDelete(null);
    }
  });

  const filteredServices = services?.filter((s: any) => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.freelancerId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.freelancerId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading gigs...</div>;

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-100 p-3 rounded-xl">
          <Briefcase className="text-emerald-600 w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">All Platform Gigs</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Gigs</h2>
            <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full">
              Total: {filteredServices?.length || 0}
            </span>
          </div>
          
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by gig or freelancer..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Gig Title</th>
                <th className="p-4 font-semibold text-gray-600">Freelancer</th>
                <th className="p-4 font-semibold text-gray-600">Category</th>
                <th className="p-4 font-semibold text-gray-600">Price</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredServices?.map((service: any) => (
                <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{service.title}</td>
                  <td className="p-4 text-gray-600">{service.freelancerId?.firstName} {service.freelancerId?.lastName}</td>
                  <td className="p-4 text-gray-600">{service.category}</td>
                  <td className="p-4 font-bold text-gray-900">${service.price}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setServiceToDelete(service)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredServices?.length === 0 && <div className="p-8 text-center text-gray-500">No gigs found matching "{searchQuery}".</div>}
        </div>
      </div>

      {serviceToDelete && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Gig?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <strong className="text-gray-800">"{serviceToDelete.title}"</strong>? This action is permanent.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setServiceToDelete(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button 
                  onClick={() => deleteMutation.mutate(serviceToDelete._id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}