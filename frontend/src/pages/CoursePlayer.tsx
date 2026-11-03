import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { ArrowLeft, PlayCircle } from 'lucide-react';

export default function CoursePlayer() {
  const { courseId } = useParams();

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => (await api.get(`/courses/${courseId}`)).data,
    enabled: !!courseId,
  });

  // --- BULLETPROOF URL CONVERTER ---
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // 1. Handle YouTube Links
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      // Handle standard watch URL
      if (url.includes('watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } 
      // Handle shortened URL (youtu.be/...)
      else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      }
      // Handle embed URL (if they pasted the embed link directly)
      else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0`;
      }
    }
    
    // 2. Handle Google Drive Links
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    
    // 3. Handle Vimeo Links
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
    
    // 4. Return raw URL (for direct .mp4 links)
    return url;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading course...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">Error loading course. Make sure you are enrolled.</div>;

  const embedUrl = getEmbedUrl(course?.videoUrl);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-6 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
          <div className="h-6 w-px bg-gray-600 mx-2"></div>
          <h1 className="text-lg font-bold truncate">{course?.title}</h1>
        </div>
        <span className="text-sm bg-indigo-600 px-3 py-1 rounded-full font-semibold hidden md:block">Course Player</span>
      </header>

      {/* Video Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700 relative">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full absolute inset-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              title={course.title}
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <PlayCircle size={64} className="mb-4 text-gray-600" />
              <p>No video provided for this course yet.</p>
              <p className="text-sm text-gray-500 mt-2">Instructor URL: {course?.videoUrl || 'Empty'}</p>
            </div>
          )}
        </div>

        {/* Course Info below video */}
        <div className="w-full max-w-5xl mt-6 bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-2">{course?.title}</h2>
          <p className="text-gray-400">{course?.description}</p>
        </div>
      </main>
    </div>
  );
}