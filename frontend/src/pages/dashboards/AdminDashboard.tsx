import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { Users, BookOpen, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();

  // 1. Fetch Users
  const { data: users, isLoading: loadingUsers, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/users/all')).data,
    enabled: !!user, 
  });

  // 2. Fetch Courses
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => (await api.get('/courses/admin/all')).data,
    enabled: !!user,
  });

  // 3. Fetch Services (Gigs)
  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => (await api.get('/services/admin/all')).data,
    enabled: !!user,
  });

  if (loadingUsers || loadingCourses || loadingServices) {
    return <div className="p-8 text-center text-gray-500">Loading platform analytics...</div>;
  }
  if (error) return <div className="p-8 text-center text-red-500">Error loading admin data.</div>;

  // --- DATA PREPARATION ---
  const students = users?.filter((u: any) => u.roles.includes('student')).length || 0;
  const instructors = users?.filter((u: any) => u.roles.includes('instructor')).length || 0;
  const freelancers = users?.filter((u: any) => u.roles.includes('freelancer')).length || 0;
  const admins = users?.filter((u: any) => u.roles.includes('admin')).length || 0;

  // Chart 1: User Distribution (Donut)
  const roleData = [
    { name: 'Students', value: students, color: '#3B82F6' },
    { name: 'Instructors', value: instructors, color: '#10B981' },
    { name: 'Freelancers', value: freelancers, color: '#8B5CF6' },
    { name: 'Admins', value: admins, color: '#6366F1' },
  ].filter(role => role.value > 0); // Hide empty roles from the chart

  // Chart 2: Content Overview (Bar)
  const contentData = [
    { 
      name: 'Courses', 
      total: courses?.length || 0, 
      active: courses?.filter((c: any) => c.isPublished).length || 0 
    },
    { 
      name: 'Gigs', 
      total: services?.length || 0, 
      active: services?.filter((s: any) => s.isActive).length || 0 
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 md:p-10 text-white shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center gap-3">
            <ShieldCheck size={36} className="text-indigo-200" /> Admin Control Center
          </h1>
          <p className="text-indigo-100 text-lg">Manage users, monitor activity, and oversee the entire platform.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Students</p>
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
            <p className="text-sm font-medium text-gray-500 mb-1">Admins</p>
            <p className="text-3xl font-extrabold text-gray-900">{admins}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl"><ShieldCheck className="text-indigo-600 w-8 h-8" /></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Role Distribution (Donut Chart) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Users className="text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">User Role Distribution</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Overview (Bar Chart) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <BookOpen className="text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">Content Overview</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="total" name="Total Created" fill="#818CF8" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="active" name="Active / Published" fill="#34D399" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}