import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { Users, X, BookOpen, Edit, DollarSign, Trash2, AlertTriangle } from 'lucide-react'; // <-- Added AlertTriangle

export default function InstructorDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseToDelete, setCourseToDelete] = useState<any>(null); // <-- State for delete modal
  
  const queryClient = useQueryClient();

  const { data: myCourses, isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => (await api.get('/courses/mine')).data
  });

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['course-students', selectedCourse?._id],
    queryFn: async () => (await api.get(`/enrollments/course/${selectedCourse._id}`)).data,
    enabled: !!selectedCourse,
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => api.delete(`/courses/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setCourseToDelete(null); // Close the modal on success
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete course.'); // Keep alert only for actual errors
      setCourseToDelete(null);
    }
  });

  const handleDeleteConfirm = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete._id);
    }
  };

  const totalRevenue = myCourses?.reduce((sum: number, course: any) => sum + (course.price || 0), 0) || 0;

  return (
    <div className="space-y-8 relative">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Courses</p>
            <p className="text-3xl font-extrabold text-gray-900">{myCourses?.length || 0}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl"><BookOpen className="text-indigo-600 w-8 h-8" /></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Active Students</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {myCourses?.reduce((sum: number, c: any) => sum + (c.studentsCount || 0), 0) || 0}
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl"><Users className="text-emerald-600 w-8 h-8" /></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Value</p>
            <p className="text-3xl font-extrabold text-gray-900">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl"><DollarSign className="text-green-600 w-8 h-8" /></div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Your Courses</h3>
          </div>
          <Link to="/dashboard/create-course" className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
            + Add New
          </Link>
        </div>
        
        {isLoading && <p className="text-gray-500">Loading your courses...</p>}
        {!isLoading && myCourses?.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 mb-2">You haven't created any courses yet.</p>
            <Link to="/dashboard/create-course" className="text-indigo-600 font-semibold hover:underline">Create your first course</Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {myCourses?.map((course: any) => (
            <div key={course._id} className="border border-gray-200 p-6 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all bg-white group">
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h4 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase whitespace-nowrap ${course.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="mb-4">
                  <span className="text-2xl font-extrabold text-gray-900">${course.price}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link to={`/dashboard/edit-course/${course._id}`} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold">
                  <Edit size={14} /> Edit
                </Link>
                <button onClick={() => setSelectedCourse(course)} className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-semibold">
                  <Users size={14} /> Students
                </button>
                {/* Open custom modal instead of alert */}
                <button 
                  onClick={() => setCourseToDelete(course)}
                  className="flex items-center justify-center bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  title="Delete Course"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CUSTOM DELETE CONFIRMATION MODAL --- */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Course?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <strong className="text-gray-800">"{courseToDelete.title}"</strong>? This action cannot be undone and all student enrollments will be lost.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setCourseToDelete(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
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

      {/* Students Modal (Unchanged) */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Enrolled Students</h2>
                <p className="text-sm text-indigo-600 font-semibold">{selectedCourse.title}</p>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-gray-700 bg-white p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {loadingStudents ? (
                <p className="text-center text-gray-500 py-8">Loading students...</p>
              ) : students?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No students have enrolled in this course yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {students?.map((student: any) => {
                    const userData = student.userId || student.student || student; 
                    return (
                      <li key={student._id} className="py-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{userData.firstName || 'Student'} {userData.lastName || ''}</p>
                          <p className="text-sm text-gray-500">{userData.email}</p>
                        </div>
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}