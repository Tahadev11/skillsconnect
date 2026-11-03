import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Trash2, ShoppingBag, Briefcase, PlusCircle, Edit } from 'lucide-react';

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: myGigs, isLoading: loadingGigs } = useQuery({
    queryKey: ['my-gigs'],
    queryFn: async () => (await api.get('/services/mine')).data
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['freelancer-orders'],
    queryFn: async () => (await api.get('/orders/freelancer')).data
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string, status: string }) => api.patch(`/orders/${orderId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['freelancer-orders'] })
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Freelancer Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome back, {user?.firstName || user?.email}! Manage your gigs and client orders.</p>
        </div>
        <Link to="/dashboard/create-gig" className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap">
          <PlusCircle size={20} /> Create New Gig
        </Link>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6 border-b pb-4">
          <ShoppingBag className="text-emerald-600" />
          <h3 className="text-xl font-bold text-gray-900">Incoming Orders</h3>
        </div>
        
        {loadingOrders ? <p className="text-gray-500">Loading orders...</p> : orders?.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">You haven't received any orders yet. Keep your gigs active!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="p-4 font-semibold rounded-tl-lg">Gig</th>
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders?.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">{order.serviceId?.title || 'Deleted Gig'}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.studentId?.firstName} {order.studentId?.lastName}
                      <br/>
                      <span className="text-xs text-gray-400">{order.studentId?.email}</span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">${order.price}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ orderId: order._id, status: 'completed' })}
                          disabled={updateStatusMutation.isPending}
                          className="text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My Gigs List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6 border-b pb-4">
          <Briefcase className="text-emerald-600" />
          <h3 className="text-xl font-bold text-gray-900">Your Active Gigs</h3>
        </div>
        
        {loadingGigs ? <p className="text-gray-500">Loading your gigs...</p> : myGigs?.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 mb-2">You haven't created any gigs yet.</p>
            <Link to="/dashboard/create-gig" className="text-emerald-600 font-semibold hover:underline">Create your first gig</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myGigs?.map((gig: any) => (
              <div key={gig._id} className="border border-gray-100 p-6 rounded-xl flex flex-col justify-between bg-gray-50 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-lg text-gray-900 leading-tight">{gig.title}</h4>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${gig.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                      {gig.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{gig.description}</p>
                  <div className="flex gap-2 text-xs mb-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">{gig.category}</span>
                    <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full font-semibold">{gig.deliveryDays} Days</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-2">
                  <p className="text-xl font-extrabold text-emerald-600">${gig.price}</p>
                  <div className="flex gap-2">
                    <Link to={`/dashboard/edit-gig/${gig._id}`} className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-1">
                      <Edit size={14} /> Edit
                    </Link>
                    <button 
                      onClick={() => { if(window.confirm('Delete this gig?')) deleteMutation.mutate(gig._id); }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}