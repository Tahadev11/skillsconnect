import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { Trash2, Users, BookOpen, Briefcase, AlertTriangle, Search, Ban, CheckCircle } from 'lucide-react';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'instructor' | 'freelancer' | 'admin'>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/users/all')).data
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUserToDelete(null);
    }
  });

  // --- BAN / UNBAN MUTATION ---
  const banMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'active' | 'banned' }) => 
      api.patch(`/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const filteredUsers = users?.filter((u: any) => {
    const matchesSearch = 
      u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = roleFilter === 'all' || u.roles.includes(roleFilter);
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

  const students = users?.filter((u: any) => u.roles.includes('student')).length || 0;
  const instructors = users?.filter((u: any) => u.roles.includes('instructor')).length || 0;
  const freelancers = users?.filter((u: any) => u.roles.includes('freelancer')).length || 0;
  const bannedCount = users?.filter((u: any) => u.status === 'banned').length || 0;

  return (
    <div className="space-y-8 relative">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Platform Users</h1>
        <p className="text-gray-600">Monitor, manage, and moderate all registered accounts.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Students</p>
            <p className="text-3xl font-extrabold text-gray-900">{students}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl"><Users className="text-blue-600 w-8 h-8" /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Instructors</p>
            <p className="text-3xl font-extrabold text-gray-900">{instructors}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl"><BookOpen className="text-emerald-600 w-8 h-8" /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Freelancers</p>
            <p className="text-3xl font-extrabold text-gray-900">{freelancers}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl"><Briefcase className="text-purple-600 w-8 h-8" /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Banned Users</p>
            <p className="text-3xl font-extrabold text-red-600">{bannedCount}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl"><Ban className="text-red-600 w-8 h-8" /></div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Registered Accounts</h2>
            <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full">
              Total: {filteredUsers?.length || 0}
            </span>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Role Filter */}
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="freelancer">Freelancers</option>
              <option value="admin">Admins</option>
            </select>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Name</th>
                <th className="p-4 font-semibold text-gray-600">Email</th>
                <th className="p-4 font-semibold text-gray-600">Role</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers?.map((u: any) => (
                <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${u.status === 'banned' ? 'bg-red-50/30' : ''}`}>
                  <td className="p-4 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`capitalize px-3 py-1 text-xs font-bold rounded-full ${
                      u.roles[0] === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                      u.roles[0] === 'instructor' ? 'bg-emerald-100 text-emerald-700' :
                      u.roles[0] === 'freelancer' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {u.roles[0]}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.status === 'banned' ? (
                      <span className="bg-red-100 text-red-700 px-3 py-1 text-xs font-bold rounded-full">BANNED</span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold rounded-full">ACTIVE</span>
                    )}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {/* Ban/Unban Toggle Button */}
                    <button 
                      onClick={() => {
                        if (u.status === 'banned') {
                          banMutation.mutate({ id: u._id, status: 'active' });
                        } else {
                          banMutation.mutate({ id: u._id, status: 'banned' });
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${u.status === 'banned' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-orange-500 hover:bg-orange-50'}`}
                      title={u.status === 'banned' ? 'Unban User' : 'Ban User'}
                    >
                      {u.status === 'banned' ? <CheckCircle size={18} /> : <Ban size={18} />}
                    </button>

                    {/* Delete Button */}
                    <button 
                      onClick={() => setUserToDelete(u)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <strong className="text-gray-800">{userToDelete.firstName} {userToDelete.lastName}</strong>? 
                This will permanently remove their account and all associated data.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setUserToDelete(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button 
                  onClick={() => deleteMutation.mutate(userToDelete._id)}
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