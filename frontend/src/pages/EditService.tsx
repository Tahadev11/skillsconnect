import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../api/client';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';

const serviceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required'),
  deliveryDays: z.string().min(1, 'Delivery days required'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  skills: z.string().optional(),
  isActive: z.boolean(),
  allowExchange: z.boolean(),
  skillsWanted: z.string().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

export default function EditService() {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceId = location.pathname.split('/').pop();
  
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${serviceId}`);
        reset({
          title: res.data.title,
          description: res.data.description,
          price: String(res.data.price),
          deliveryDays: String(res.data.deliveryDays),
          category: res.data.category,
          skills: res.data.skills?.join(', ') || '',
          isActive: res.data.isActive,
          allowExchange: res.data.allowExchange || false,
          skillsWanted: res.data.skillsWanted || '',
        });
      } catch (err) {
        setApiError('Failed to load gig data.');
      } finally {
        setIsLoading(false);
      }
    };
    if (serviceId) fetchService();
  }, [serviceId, reset]);

  const onSubmit = async (data: ServiceForm) => {
    setApiError('');
    try {
      await api.patch(`/services/${serviceId}`, {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        deliveryDays: Number(data.deliveryDays),
        category: data.category,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        isActive: data.isActive,
        allowExchange: data.allowExchange,
        skillsWanted: data.skillsWanted,
      });
      navigate('/dashboard'); 
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to update gig.');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading gig data...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 font-medium transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8 border-b pb-6">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <Edit className="text-emerald-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Gig</h2>
            <p className="text-gray-500 text-sm">Update the details of your freelance service.</p>
          </div>
        </div>
        
        {apiError && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 font-medium">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gig Title</label>
            <input {...register('title')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea {...register('description')} rows={5} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
              <input type="number" step="0.01" {...register('price')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Time (Days)</label>
              <input type="number" {...register('deliveryDays')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              {errors.deliveryDays && <p className="text-red-500 text-sm mt-1">{errors.deliveryDays.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <input {...register('category')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (Comma separated)</label>
              <input {...register('skills')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
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
            <input type="checkbox" id="isActive" {...register('isActive')} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer" />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
              Make this Gig Active (visible to public)
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm text-lg">
            {isSubmitting ? 'Updating...' : 'Update Gig'}
          </button>
        </form>
      </div>
    </div>
  );
}