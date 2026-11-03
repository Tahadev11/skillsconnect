import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Briefcase, GraduationCap, ArrowRight, Zap } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Zap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">SkillsConnect</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/courses" className="text-gray-600 font-medium hover:text-indigo-600 hidden md:block transition-colors">Courses</Link>
              <Link to="/services" className="text-gray-600 font-medium hover:text-emerald-600 hidden md:block transition-colors">Gigs</Link>
              <Link to="/directory" className="text-gray-600 font-medium hover:text-indigo-600 hidden md:block transition-colors">Skills Directory</Link>
              {user ? (
                <Link to="/dashboard" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 font-medium hover:text-indigo-600 px-4">Log in</Link>
                  <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
            Learn, Teach, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">Freelance.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            SkillsConnect is the all-in-one platform where students learn new skills, instructors build courses, and freelancers offer their services to the world.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/courses" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl">
              <BookOpen size={20} /> Explore Courses
            </Link>
            <Link to="/services" className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl">
              <Briefcase size={20} /> Hire a Freelancer
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">One Platform, Three Ways to Grow</h2>
            <p className="text-gray-600 mt-4 text-lg">Whether you want to learn, teach, or work, we have a place for you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <GraduationCap className="text-indigo-600 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Students</h3>
              <p className="text-gray-600 mb-6">
                Browse thousands of courses to upgrade your skills, or hire expert freelancers to help you build your next big idea.
              </p>
              <Link to="/register" className="text-indigo-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Join as a Student <ArrowRight size={16} />
              </Link>
            </div>

            {/* Instructor Card */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Popular</div>
              <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="text-indigo-600 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Instructors</h3>
              <p className="text-gray-600 mb-6">
                Share your knowledge with the world. Create engaging video courses, set your own price, and earn passive income.
              </p>
              <Link to="/register" className="text-indigo-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Become an Instructor <ArrowRight size={16} />
              </Link>
            </div>

            {/* Freelancer Card */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="text-emerald-600 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Freelancers</h3>
              <p className="text-gray-600 mb-6">
                Offer your professional services as "Gigs". Connect with clients, manage orders, and grow your freelance business.
              </p>
              <Link to="/register" className="text-emerald-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Start Freelancing <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-600 w-5 h-5" />
            <span className="text-lg font-bold text-gray-900">SkillsConnect</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 SkillsConnect. Built for the modern web.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}