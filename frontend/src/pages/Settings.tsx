import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User, Lock, CheckCircle2, AlertCircle, Tag } from 'lucide-react'; // <-- Added Tag

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  bio: z.string().optional(),
  skills: z.string().optional(), // Comma separated
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function Settings() {
const { user, updateUser } = useAuth(); // <-- Add updateUser  
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: isProfileSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      skills: user?.skills?.join(', ') || '', // <-- Added: Populate existing skills
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }, reset: resetPasswordForm } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

const onProfileSubmit = async (data: ProfileForm) => {
  setProfileStatus(null);
  try {
    const skills = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    await api.patch('/users/profile', {
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      skills,
    });

    // Update local user (fixes the empty field after refresh!)
    updateUser({
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      skills,
    });

    setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
  } catch (err: any) {
    setProfileStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' });
  }
};
  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordStatus(null);
    try {
      await api.patch('/users/password', data);
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      resetPasswordForm();
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your profile information and account security.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <User className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-500">Update your personal details here.</p>
          </div>
        </div>

        {profileStatus && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-medium border ${
            profileStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {profileStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {profileStatus.message}
          </div>
        )}

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <input {...registerProfile('firstName')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              {profileErrors.firstName && <p className="text-red-500 text-sm mt-1">{profileErrors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <input {...registerProfile('lastName')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              {profileErrors.lastName && <p className="text-red-500 text-sm mt-1">{profileErrors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea {...registerProfile('bio')} rows={3} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Tell us about yourself, your skills, and what you want to learn..." />
          </div>

          {/* SKILLS INPUT */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Tag size={16} className="text-indigo-600" /> Skills You Can Teach
            </label>
            <input 
              {...registerProfile('skills')} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="e.g., React, UI Design, Python, Guitar" 
            />
            <p className="text-xs text-gray-500 mt-1">Separate skills with commas. These will appear in the public Skills Directory so others can find you for skill exchanges.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Cannot be changed)</label>
            <input value={user?.email} disabled className="w-full border border-gray-200 p-3 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>

          <button type="submit" disabled={isProfileSubmitting} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {isProfileSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Password Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="bg-red-100 p-3 rounded-xl">
            <Lock className="text-red-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500">Ensure your account is using a strong password.</p>
          </div>
        </div>

        {passwordStatus && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-medium border ${
            passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {passwordStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {passwordStatus.message}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
            <input type="password" {...registerPassword('currentPassword')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input type="password" {...registerPassword('newPassword')} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>}
          </div>

          <button type="submit" disabled={isPasswordSubmitting} className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isPasswordSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}