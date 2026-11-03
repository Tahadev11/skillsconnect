import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth
import { Zap, CheckCircle2 } from 'lucide-react'; // <-- Added CheckCircle2

export default function Register() {
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', password: '', role: 'student' 
  });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- Get login function

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // 1. Register the user
      await api.post('/auth/register', { 
        ...formData, 
        roles: [formData.role] 
      });

      // 2. Automatically log them in
      const loginResponse = await api.post('/auth/login', { 
        email: formData.email, 
        password: formData.password 
      });

      const { accessToken, user } = loginResponse.data;
      const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'student';
      
      // 3. Show success message briefly
      setIsSuccess(true);
      
      // 4. Save user to context and redirect to dashboard
      setTimeout(() => {
        login({ ...user, role: primaryRole }, accessToken);
        navigate('/dashboard');
      }, 1500); // 1.5 seconds to show the success animation

    } catch (err: any) {
      const message = err.response?.data?.message;
      setError(Array.isArray(message) ? message[0] : message || 'Registration failed.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500">Logging you in and preparing your dashboard...</p>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-gray-900">SkillsConnect</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="First Name" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            <input type="text" placeholder="Last Name" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          </div>
          <input type="email" placeholder="Email" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <input type="password" placeholder="Password (min 6 chars)" required minLength={6} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

          <div className="pt-2">
            <p className="text-sm font-semibold text-gray-700 mb-3">I want to join as:</p>
            <div className="flex flex-col gap-3">
              {['student', 'instructor', 'freelancer'].map((role) => (
                <label key={role} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${formData.role === role ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="capitalize font-medium text-gray-800">{role}</span>
                  <input type="radio" name="role" value={role} checked={formData.role === role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm mt-4">
            Create Account
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}