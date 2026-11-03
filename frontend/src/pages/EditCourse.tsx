import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../api/client';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required'),
  videoUrl: z.string().optional(),
  isPublished: z.boolean(),
  allowExchange: z.boolean(),
  skillsWanted: z.string().optional(),
});

type CourseForm = z.infer<typeof courseSchema>;

export default function EditCourse() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const pathParts = location.pathname.split('/');
  const courseId = params.courseId || pathParts[pathParts.length - 1];

  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
  });

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId || courseId === 'undefined') {
        setApiError('Invalid Course ID.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get(`/courses/${courseId}`);
        reset({
          title: res.data.title,
          description: res.data.description,
          price: String(res.data.price),
          videoUrl: res.data.videoUrl || '',
          isPublished: res.data.isPublished,
          allowExchange: res.data.allowExchange || false,
          skillsWanted: res.data.skillsWanted || '',
        });
      } catch (err) {
        setApiError('Failed to load course data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, reset]);

  const onSubmit = async (data: CourseForm) => {
    setApiError('');
    try {
      await api.patch(`/courses/${courseId}`, {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        videoUrl: data.videoUrl,
        isPublished: data.isPublished,
        allowExchange: data.allowExchange,
        skillsWanted: data.skillsWanted,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to update course.');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-gray-500 animate-pulse text-lg">Loading course data...</div></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 font-medium transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <Edit className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
            <p className="text-gray-500 text-sm">Update the details of your existing course.</p>
          </div>
        </div>

        {apiError && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 font-medium">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title</label>
            <input {...register('title')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea {...register('description')} rows={5} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
            <input type="number" step="0.01" {...register('price')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Course Video Link</label>
            <input {...register('videoUrl')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="https://drive.google.com/file/d/..." />
          </div>

          {/* BARTER MODE */}
          <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="allowExchange" {...register('allowExchange')} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer" />
              <label htmlFor="allowExchange" className="text-sm font-bold text-purple-900 cursor-pointer">
                🔄 Allow Skill Exchange (Barter Mode)
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-purple-800 mb-2">What skills do you want in return?</label>
              <input {...register('skillsWanted')} className="w-full border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <input type="checkbox" id="isPublished" {...register('isPublished')} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 cursor-pointer">
              Course is Published (visible to students)
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm text-lg">
            {isSubmitting ? 'Updating...' : 'Update Course'}
          </button>
        </form>
      </div>
    </div>
  );
}