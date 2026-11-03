import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Search, MessageSquare, Tag, GraduationCap, Briefcase, Plus, X, Edit } from 'lucide-react';

export default function SkillsDirectory() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['skills-directory'],
    queryFn: async () => (await api.get('/users/directory')).data,
  });

  const updateSkillsMutation = useMutation({
    mutationFn: (skills: string[]) => api.patch('/users/profile', { skills }),
    onSuccess: (_, newSkills) => {
      updateUser({ skills: newSkills });
      queryClient.invalidateQueries({ queryKey: ['skills-directory'] });
      setShowAddModal(false);
      setSkillInput('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to add skills. Try again.');
    }
  });

  const handleAddSkills = () => {
    const skills = skillInput.split(',').map(s => s.trim()).filter(Boolean);
    if (skills.length > 0) {
      updateSkillsMutation.mutate(skills);
    }
  };

  // Separate my profile from the rest
  const myProfile = profiles?.find((p: any) => p._id === user?.id);
  const otherProfiles = profiles?.filter((p: any) => p._id !== user?.id);

  const filteredProfiles = otherProfiles?.filter((profile: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      profile.firstName?.toLowerCase().includes(query) ||
      profile.lastName?.toLowerCase().includes(query) ||
      profile.bio?.toLowerCase().includes(query) ||
      profile.skills?.some((s: string) => s.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
                <Users className="text-indigo-600 w-10 h-10" /> Skills Directory
              </h1>
              <p className="text-gray-600 text-lg">Find someone to exchange skills with. Everyone here has something to teach.</p>
            </div>
            <div className="flex gap-3">
              {user && (
                <button
                  onClick={() => {
                    setSkillInput(user.skills?.join(', ') || '');
                    setShowAddModal(true);
                  }}
                  className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus size={18} /> {user.skills?.length ? 'Update My Skills' : 'Add My Skills'}
                </button>
              )}
              {user ? (
                <Link to="/dashboard" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm">
                  Join to Connect
                </Link>
              )}
            </div>
          </div>

          {/* --- MY PROFILE CARD (Shown First) --- */}
          {user && myProfile && (
            <div className="mb-10">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Your Profile</h2>
              <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                            <Tag size={12} /> {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No skills added yet</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSkillInput(user.skills?.join(', ') || '');
                    setShowAddModal(true);
                  }}
                  className="bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Edit size={16} /> Edit Skills
                </button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative mb-10 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, skill (React, Python), or bio..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Directory Grid */}
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Other Members</h2>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredProfiles?.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No profiles found matching "{searchQuery}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles?.map((profile: any) => (
                <div 
                  key={profile._id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                        {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900 text-lg">{profile.firstName} {profile.lastName}</h2>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 ${
                          profile.roles[0] === 'instructor' ? 'bg-emerald-100 text-emerald-700' :
                          profile.roles[0] === 'freelancer' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {profile.roles[0] === 'instructor' ? <GraduationCap size={10} /> : 
                           profile.roles[0] === 'freelancer' ? <Briefcase size={10} /> : 
                           <Users size={10} />}
                          {profile.roles[0]}
                        </span>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 italic">"{profile.bio}"</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.skills?.map((skill: string, i: number) => (
                        <span key={i} className="flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                          <Tag size={12} /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {user && profile._id !== user?.id && (
                    <button 
                      onClick={() => navigate(`/dashboard/messages`)}
                      className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={16} /> Message to Exchange
                    </button>
                  )}
                  {!user && (
                    <Link to="/login" className="w-full text-center bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors block">
                      Login to Connect
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- ADD SKILLS MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Add Your Skills</h3>
                  <p className="text-gray-500 text-sm mt-1">What can you teach others? Separate with commas.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 p-1">
                  <X size={20} />
                </button>
              </div>
              
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g., React, UI Design, Python, Guitar"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
                autoFocus
              />
              
              <div className="flex gap-3">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button 
                  onClick={handleAddSkills}
                  disabled={updateSkillsMutation.isPending || !skillInput.trim()}
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {updateSkillsMutation.isPending ? 'Saving...' : 'Save Skills'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}