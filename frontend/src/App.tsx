import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Services from './pages/Services'; 
import CoursePlayer from './pages/CoursePlayer';
import SkillsDirectory from './pages/SkillsDirectory';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/services" element={<Services />} />
            <Route path="/directory" element={<SkillsDirectory />} />
            <Route path="/course/:courseId" element={<CoursePlayer />} />

            {/* Protected Routes (The * handles everything inside Dashboard) */}
            <Route path="/dashboard/*" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;