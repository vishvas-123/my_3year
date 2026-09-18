import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { SkillBadge } from '../components/Badge';
import confetti from 'canvas-confetti';
import {
  User,
  Edit3,
  ExternalLink,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Award,
  Loader2,
  X,
  GraduationCap
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/SocialIcons';

export default function ProfilePage() {
  const { user, refreshUser, updateProfile } = useAuth();

  // Edit profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    college: '',
    bio: '',
    avatar: '',
    githubUrl: '',
    linkedinUrl: '',
    graduationYear: '',
    major: '',
    interests: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Add skill modal
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillForm, setSkillForm] = useState({
    skillName: '',
    type: 'TEACH',
    level: 'INTERMEDIATE',
    category: 'Engineering'
  });
  const [addingSkill, setAddingSkill] = useState(false);

  // Add portfolio modal
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: ''
  });
  const [addingPortfolio, setAddingPortfolio] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        college: user.college || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        graduationYear: user.profile?.graduationYear || '',
        major: user.profile?.major || '',
        interests: user.profile?.interests || ''
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfile(editForm);
      setShowEditModal(false);
      refreshUser();
      confetti({ particleCount: 30, spread: 50 });
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.skillName.trim()) return;
    try {
      setAddingSkill(true);
      const res = await api.post('/users/skills', skillForm);
      if (res.data.success) {
        setShowSkillModal(false);
        setSkillForm({ skillName: '', type: 'TEACH', level: 'INTERMEDIATE', category: 'Engineering' });
        refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add skill');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const res = await api.delete(`/users/skills/${skillId}`);
      if (res.data.success) {
        refreshUser();
      }
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    try {
      setAddingPortfolio(true);
      const res = await api.post('/users/portfolio', portfolioForm);
      if (res.data.success) {
        setShowPortfolioModal(false);
        setPortfolioForm({ title: '', description: '', techStack: '', githubUrl: '', liveUrl: '' });
        refreshUser();
        confetti({ particleCount: 40, spread: 60 });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add portfolio item');
    } finally {
      setAddingPortfolio(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!window.confirm('Delete this portfolio project?')) return;
    try {
      const res = await api.delete(`/users/portfolio/${id}`);
      if (res.data.success) {
        refreshUser();
      }
    } catch (err) {
      console.error('Failed to delete portfolio:', err);
    }
  };

  const teachSkills = user?.skills?.filter(s => s.type === 'TEACH') || [];
  const learnSkills = user?.skills?.filter(s => s.type === 'LEARN') || [];
  const portfolioProjects = user?.portfolioProjects || [];
  const completion = user?.profile?.profileCompletion || 30;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Profile Banner & Bio Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Banner strip */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500" />

        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-12 mb-4">
            <div className="flex items-end gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-lg bg-white"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                  {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                </div>
              )}

              <div className="pb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {user?.name}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {user?.role}
                  </span>
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  {user?.college || 'College Affiliation not set'}
                </p>
              </div>
            </div>

            {/* Edit Profile & Public Link */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Link
                to={`/profile/${user?.id}`}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Public View
              </Link>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Bio text & social handles */}
          <div className="max-w-3xl space-y-3 pt-2">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {user?.bio || 'No bio written yet. Click "Edit Profile" to share your interests and background.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-500">
              {user?.profile?.major && (
                <span>Major: <strong className="text-slate-700 dark:text-slate-200">{user.profile.major}</strong></span>
              )}
              {user?.profile?.graduationYear && (
                <span>Class of: <strong className="text-slate-700 dark:text-slate-200">{user.profile.graduationYear}</strong></span>
              )}
              {user?.githubUrl && (
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  GitHub
                </a>
              )}
              {user?.linkedinUrl && (
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              )}
            </div>

            {/* Badges */}
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Badges:
              </span>
              {(user?.profile?.badges || 'Student Pioneer').split(',').map((badge, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {badge.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Exchange Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills I Can Teach */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Skills I Can Teach (Mentoring)
              </h2>
              <p className="text-[11px] text-slate-400">Skills you are confident sharing with peers.</p>
            </div>
            <button
              onClick={() => {
                setSkillForm({ ...skillForm, type: 'TEACH' });
                setShowSkillModal(true);
              }}
              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {teachSkills.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No teaching skills added yet.</p>
            ) : (
              teachSkills.map((s) => (
                <SkillBadge
                  key={s.id}
                  name={s.skill.name}
                  level={s.level}
                  type="TEACH"
                  onRemove={() => handleRemoveSkill(s.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                Skills I Want to Learn (Learning Goals)
              </h2>
              <p className="text-[11px] text-slate-400">Topics you are actively looking to study.</p>
            </div>
            <button
              onClick={() => {
                setSkillForm({ ...skillForm, type: 'LEARN' });
                setShowSkillModal(true);
              }}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {learnSkills.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No learning skills added yet.</p>
            ) : (
              learnSkills.map((s) => (
                <SkillBadge
                  key={s.id}
                  name={s.skill.name}
                  level={s.level}
                  type="LEARN"
                  onRemove={() => handleRemoveSkill(s.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Showcase Portfolio Projects */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Portfolio Projects Showcase
            </h2>
            <p className="text-xs text-slate-500">
              Completed projects you've built and want to showcase on your public student profile.
            </p>
          </div>
          <button
            onClick={() => setShowPortfolioModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Portfolio Project
          </button>
        </div>

        {portfolioProjects.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No portfolio projects added yet
            </p>
            <p className="text-[11px] text-slate-400">
              Feature your GitHub repositories and live deployments to attract learning partners!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{proj.title}</h3>
                    <button
                      onClick={() => handleDeletePortfolio(proj.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {proj.description}
                  </p>
                  <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                    {proj.techStack}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      Code
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-indigo-600 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Student Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">College / University</label>
                  <input
                    type="text"
                    value={editForm.college}
                    onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Avatar Photo URL</label>
                <input
                  type="url"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Major / Degree</label>
                  <input
                    type="text"
                    value={editForm.major}
                    onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={editForm.graduationYear}
                    onChange={(e) => setEditForm({ ...editForm, graduationYear: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={editForm.githubUrl}
                    onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={editForm.linkedinUrl}
                    onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                >
                  {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {skillForm.type === 'TEACH' ? 'Add Skill You Can Teach' : 'Add Skill to Learn'}
              </h3>
              <button onClick={() => setShowSkillModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={skillForm.skillName}
                  onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                  placeholder="e.g. Next.js, Rust, Docker, PyTorch"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Proficiency Level</label>
                <select
                  value={skillForm.level}
                  onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingSkill}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                >
                  {addingSkill ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Portfolio Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Portfolio Project</h3>
              <button onClick={() => setShowPortfolioModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPortfolio} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  placeholder="e.g. Distributed Task Queue"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  placeholder="Key features, architectural patterns, and performance results..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Tech Stack *</label>
                <input
                  type="text"
                  required
                  value={portfolioForm.techStack}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, techStack: e.target.value })}
                  placeholder="e.g. Go, Redis, Docker, gRPC"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={portfolioForm.githubUrl}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Live URL</label>
                  <input
                    type="url"
                    value={portfolioForm.liveUrl}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPortfolioModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingPortfolio}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                >
                  {addingPortfolio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
