import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Briefcase, ArrowRight, PlayCircle } from 'lucide-react'; // <-- Added PlayCircle

export default function StudentDashboard() {
  const { user, updateRole } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [confirmDropId, setConfirmDropId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => (await api.get('/enrollments/me')).data
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await api.get('/orders/me')).data
  });

  const unenrollMutation = useMutation({
    mutationFn: (courseId: string) => api.delete(`/enrollments/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      setConfirmDropId(null);
    }
  });

  const upgradeTo = async (newRole: 'instructor' | 'freelancer') => {
    if (!window.confirm(`Are you sure you want to become a ${newRole}? You CANNOT switch back later!`)) return;
    setUpgrading(true);
    try {
      await api.patch('/users/upgrade-role', { role: newRole });
      updateRole(newRole);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upgrade role.');
      setUpgrading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 md:p-10 text-white shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Welcome back, {user?.firstName || 'Student'}!</h1>
        <p className="text-indigo-100 text-lg">Ready to learn something new or hire a professional today?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ENROLLED COURSES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="text-indigo-600" /> My Learning
            </h2>
            <Link to="/courses" className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              Find Courses <ArrowRight size={16} />
            </Link>
          </div>

          {loadingEnrollments ? <p className="text-gray-500">Loading...</p> : enrollments?.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">You aren't enrolled in any courses.</p>
              <Link to="/courses" className="text-indigo-600 font-semibold hover:underline">Browse Catalog</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments?.map((enrollment: any) => {
                const course = enrollment.courseId || enrollment.course; 
                const isConfirming = confirmDropId === enrollment._id;

                // --- HANDLE UNAVAILABLE COURSES ---
                if (!course) {
                  return (
                    <div key={enrollment._id} className="border border-red-100 p-4 rounded-xl flex justify-between items-center bg-red-50">
                      <div>
                        <h3 className="font-bold text-red-800">Course Unavailable</h3>
                        <p className="text-sm text-red-600">This course was removed by the instructor.</p>
                      </div>
                      <button 
                        onClick={() => unenrollMutation.mutate(enrollment._id)}
                        className="text-sm px-3 py-1.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  );
                }

                // --- HANDLE NORMAL COURSES ---
                return (
                  <div key={enrollment._id} className="border border-gray-100 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between hover:shadow-sm transition-shadow bg-gray-50 gap-4 group">
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* --- ADDED PLAY BUTTON --- */}
                      <Link 
                        to={`/course/${course._id}`}
                        className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <PlayCircle size={16} /> Play
                      </Link>

                      <button 
                        onClick={() => {
                          if (isConfirming) {
                            unenrollMutation.mutate(course._id);
                          } else { 
                            setConfirmDropId(enrollment._id); 
                            setTimeout(() => setConfirmDropId(null), 3000); 
                          }
                        }}
                        className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${isConfirming ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-50'}`}
                      >
                        {isConfirming ? 'Confirm?' : 'Drop'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* HIRED GIGS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="text-emerald-600" /> My Hired Gigs
            </h2>
            <Link to="/services" className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-1">
              Find Freelancers <ArrowRight size={16} />
            </Link>
          </div>

          {loadingOrders ? <p className="text-gray-500">Loading...</p> : orders?.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">You haven't hired anyone yet.</p>
              <Link to="/services" className="text-emerald-600 font-semibold hover:underline">Browse Gigs</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders?.map((order: any) => (
                <div key={order._id} className="border border-gray-100 p-4 rounded-xl hover:shadow-sm transition-shadow bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{order.serviceId?.title || 'Deleted Gig'}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Freelancer: {order.freelancerId?.firstName} {order.freelancerId?.lastName}</p>
                  <p className="text-lg font-bold text-emerald-600 mt-2">${order.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* UPGRADE SECTION */}
      <div className="bg-gray-900 rounded-2xl p-8 md:p-10 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Want to teach or work?</h2>
        <p className="text-gray-400 mb-6 max-w-2xl">
          You are currently registered as a Student. You can choose to upgrade your account to an Instructor (to create courses) or a Freelancer (to offer services).
          <br /><strong className="text-red-400">Warning:</strong> You can only do this once, and you cannot switch back.
        </p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => upgradeTo('instructor')} disabled={upgrading} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            Become an Instructor
          </button>
          <button onClick={() => upgradeTo('freelancer')} disabled={upgrading} className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
            Become a Freelancer
          </button>
        </div>
      </div>
    </div>
  );
}