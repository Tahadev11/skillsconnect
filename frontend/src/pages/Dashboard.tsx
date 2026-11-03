import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import StudentDashboard from './dashboards/StudentDashboard';
import InstructorDashboard from './dashboards/InstructorDashboard';
import FreelancerDashboard from './dashboards/FreelancerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminCourses from './admin/AdminCourses';
import AdminServices from './admin/AdminServices';
import AdminTransactions from './admin/AdminTransactions';
import CreateCourse from './CreateCourse';
import EditCourse from './EditCourse';
import CreateService from './CreateService';
import EditService from './EditService';
import MessagesPage from './MessagesPage';
import Settings from './Settings';

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Sub-routes
  const isMessages = location.pathname === '/dashboard/messages';
  const isSettings = location.pathname === '/dashboard/settings'; // <-- Added check
  const isCreatingCourse = location.pathname === '/dashboard/create-course';
  const isEditingCourse = location.pathname.includes('/dashboard/edit-course/');
  const isCreatingGig = location.pathname === '/dashboard/create-gig';
  const isEditingGig = location.pathname.includes('/dashboard/edit-gig/');

  // Admin Routes
  const isAdminUsers = location.pathname === '/dashboard/admin/users';
  const isAdminCourses = location.pathname === '/dashboard/admin/courses';
  const isAdminServices = location.pathname === '/dashboard/admin/services';
  const isAdminTransactions = location.pathname === '/dashboard/admin/transactions'; // <-- Add check


  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      <Sidebar />

      {/* Changed: md:ml-64 instead of ml-64 */}
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen pt-16 md:pt-0">
        <header className="bg-white border-b border-gray-200 h-20 flex items-center px-4 md:px-8 justify-between sticky top-0 z-30">
          <h2 className="text-xl font-bold text-gray-800 capitalize pl-10 md:pl-0">
            {location.pathname === '/dashboard' ? `${user.role} Dashboard` : 'Manage'}
          </h2>
          <div className="text-sm text-gray-500 hidden md:block">
            Welcome back, <span className="font-semibold text-gray-900">{user.firstName || user.email}</span>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-x-hidden">
          {isMessages ? (
            <MessagesPage />
          ) : isSettings ? ( // <-- Added Settings Route Logic
            <Settings />
          ) : isCreatingCourse ? (
            user.role === 'instructor' ? <CreateCourse /> : <div className="text-red-500 font-bold">Access Denied</div>
          ) : isEditingCourse ? (
            user.role === 'instructor' ? <EditCourse /> : <div className="text-red-500 font-bold">Access Denied</div>
          ) : isCreatingGig ? (
            user.role === 'freelancer' ? <CreateService /> : <div className="text-red-500 font-bold">Access Denied</div>
          ) : isEditingGig ? (
            user.role === 'freelancer' ? <EditService /> : <div className="text-red-500 font-bold">Access Denied</div>
          ) : isAdminUsers ? (
            user.role === 'admin' ? <AdminUsers /> : <div className="text-red-500 font-bold">Access Denied</div>
          ) : isAdminCourses ? (
            user.role === 'admin' ? <AdminCourses /> : <div className="text-red-500 font-bold">Access Denied</div>
          ) : isAdminServices ? (
            user.role === 'admin' ? <AdminServices /> : <div className="text-red-500 font-bold">Access Denied</div>
          ) : isAdminTransactions ? (
            user.role === 'admin' ? <AdminTransactions /> : <div className="text-red-500 font-bold">Access Denied</div>
          ) : (

            <>
              {user.role === 'student' && <StudentDashboard />}
              {user.role === 'instructor' && <InstructorDashboard />}
              {user.role === 'freelancer' && <FreelancerDashboard />}
              {user.role === 'admin' && <AdminDashboard />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}