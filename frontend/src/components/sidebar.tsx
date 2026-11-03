import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Briefcase,
  ShoppingBag,
  LogOut,
  GraduationCap,
  MessageSquare,
  Settings as SettingsIcon,
  Menu,
  X,
  Wallet,
  Users
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    const baseLinks = [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Messages', path: '/dashboard/messages', icon: <MessageSquare size={20} /> },
      { name: 'Settings', path: '/dashboard/settings', icon: <SettingsIcon size={20} /> },
    ];

    if (user?.role === 'instructor') {
      return [...baseLinks, { name: 'Create Course', path: '/dashboard/create-course', icon: <PlusCircle size={20} /> }];
    }
    if (user?.role === 'freelancer') {
      return [...baseLinks, { name: 'Create Gig', path: '/dashboard/create-gig', icon: <Briefcase size={20} /> }];
    }
    if (user?.role === 'admin') {
      return [
        { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Transactions', path: '/dashboard/admin/transactions', icon: <Wallet size={20} /> }, // <-- Transactions here
        { name: 'Manage Users', path: '/dashboard/admin/users', icon: <GraduationCap size={20} /> },
        { name: 'Manage Courses', path: '/dashboard/admin/courses', icon: <BookOpen size={20} /> },
        { name: 'Manage Gigs', path: '/dashboard/admin/services', icon: <Briefcase size={20} /> },
        { name: 'Settings', path: '/dashboard/settings', icon: <SettingsIcon size={20} /> },
      ];
    }
    return baseLinks;
  };

  const links = getLinks();

  const SidebarContent = () => (
    <>
      <div className="h-20 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-900">
        <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="bg-indigo-500 text-white p-1 rounded-md text-sm">SC</span>
          SkillsConnect
        </Link>
        <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
        {links.map((link) => {
          const isActive = link.path === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}

        <div className="pt-6 mt-6 border-t border-gray-800">
          <Link to="/courses" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <BookOpen size={20} /> Explore Courses
          </Link>
          <Link to="/services" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <ShoppingBag size={20} /> Explore Gigs
          </Link>
          <Link to="/directory" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <Users size={20} /> Skills Directory
          </Link>
        </div>
      </nav>

      <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
            {user?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.firstName || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg font-medium text-red-400 hover:text-white hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu size={24} />
      </button>

      <aside className="hidden md:flex flex-col w-64 h-screen bg-gray-900 text-white fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}