import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase } from 'lucide-react';

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

export default function CreateService() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { isActive: true, allowExchange: false }
  });

  const onSubmit = async (data: ServiceForm) => {
    setApiError('');
    try {
      await api.post('/services', {
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
      setApiError(err.response?.data?.message || 'Failed to create gig.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 font-medium transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8 border-b pb-6">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <Briefcase className="text-emerald-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create a New Gig</h2>
            <p className="text-gray-500 text-sm">Describe the service you want to offer to clients.</p>
          </div>
        </div>
        
        {apiError && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 font-medium">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gig Title</label>
            <input {...register('title')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="e.g., I will build a modern React website" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea {...register('description')} rows={5} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Describe what you will deliver..." />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
              <input type="number" step="0.01" {...register('price')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="50.00" />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Time (Days)</label>
              <input type="number" {...register('deliveryDays')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="3" />
              {errors.deliveryDays && <p className="text-red-500 text-sm mt-1">{errors.deliveryDays.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <input {...register('category')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="e.g., Web Development" />
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (Comma separated)</label>
              <input {...register('skills')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="React, Node.js, Tailwind" />
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
              <input {...register('skillsWanted')} className="w-full border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="e.g., I want to learn Video Editing, SEO..." />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <input type="checkbox" id="isActive" {...register('isActive')} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer" />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
              Make this Gig Active (visible to public)
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm text-lg">
            {isSubmitting ? 'Publishing...' : 'Publish Gig'}
          </button>
        </form>
      </div>
    </div>
  );
}