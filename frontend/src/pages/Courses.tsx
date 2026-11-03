import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourses } from '../api/course';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Tag, Search, RefreshCw } from 'lucide-react';
import ChatModal from '../components/ChatModal'; // <-- Import Modal

export default function Courses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // State for the Chat Modal
  const [chatTarget, setChatTarget] = useState<{ id: string; name: string; title: string } | null>(null);

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => api.post(`/enrollments/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      setToastMessage('Successfully enrolled! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1500);
    },
    onError: (err: any) => {
      setToastMessage(err.response?.data?.message || 'Failed to enroll.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  });

  const filteredCourses = courses?.filter((course: any) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Loading courses...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Error loading courses.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 relative">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down font-medium">
          {toastMessage}
        </div>
      )}

      {/* --- CHAT MODAL --- */}
      <ChatModal 
        isOpen={!!chatTarget}
        onClose={() => setChatTarget(null)}
        otherUserId={chatTarget?.id || ''}
        otherUserName={chatTarget?.name || 'Instructor'}
        itemTitle={chatTarget?.title || ''}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
              <BookOpen className="text-indigo-600 w-10 h-10" /> Explore Courses
            </h1>
            <p className="text-gray-600 text-lg">Learn new skills from expert instructors.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/services" className="flex items-center gap-2 text-gray-600 font-medium hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              Browse Gigs
            </Link>
            {user ? (
              <Link to="/dashboard" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm">
                Login to Enroll
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
            placeholder="Search courses by title or description..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredCourses?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-lg">No courses found matching "{searchQuery}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses?.map((course: any) => (
              <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{course.title}</h2>
                  </div>
                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{course.description}</p>

                  {/* BARTER BADGE */}
                  {course.allowExchange && (
                    <div className="mb-4 bg-purple-50 border border-purple-100 rounded-lg p-3">
                      <p className="text-sm font-bold text-purple-800 flex items-center gap-1">
                        <RefreshCw size={14} /> Open to Skill Exchange
                      </p>
                      {course.skillsWanted && (
                        <p className="text-xs text-purple-600 mt-1">Wants to learn: {course.skillsWanted}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-4">
                    <span className="text-2xl font-extrabold text-indigo-600">${course.price}</span>
                    {course.category && (
                      <span className="flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                        <Tag size={12} /> {course.category}
                      </span>
                    )}
                  </div>

                  {!user && (
                    <Link to="/login" className="block text-center w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                      Login to Enroll
                    </Link>
                  )}

                  {user && user.role === 'student' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => enrollMutation.mutate(course._id)}
                        disabled={enrollMutation.isPending}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {enrollMutation.isPending ? 'Enrolling...' : 'Buy Course'}
                      </button>

                      {/* BARTER BUTTON -> OPENS MODAL */}
                      {course.allowExchange && (
                        <button
                          onClick={() => setChatTarget({ 
                            id: course.instructorId?._id || course.instructorId, 
                            name: course.instructorId?.firstName || 'Instructor',
                            title: course.title
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
                      Only students can enroll
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