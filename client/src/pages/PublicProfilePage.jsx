import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { SkillBadge } from '../components/Badge';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Award,
  GraduationCap,
  ExternalLink,
  MessageSquare,
  Send,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/SocialIcons';

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${id}`);
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Failed to load student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const res = await api.post('/connections/request', {
        receiverId: id,
        note: `Hi ${profile.name}! I found your portfolio on SkillBridge and would love to connect for peer skill exchange.`
      });

      if (res.data.success) {
        confetti({ particleCount: 50, spread: 60 });
        setConnected(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-12 text-center text-slate-500">
        Student profile not found.
      </div>
    );
  }

  const teachSkills = profile.skills?.filter(s => s.type === 'TEACH') || [];
  const learnSkills = profile.skills?.filter(s => s.type === 'LEARN') || [];
  const isMe = user?.id === profile.id;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <Link
        to="/skills"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Skill Exchange
      </Link>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700" />

        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 mb-4">
            <div className="flex items-end gap-4">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-lg bg-white"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                  {profile.name?.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="pb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {profile.name}
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  {profile.college || 'College Student'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            {!isMe && (
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <Link
                  to={`/chat?userId=${profile.id}`}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message
                </Link>

                <button
                  onClick={handleConnect}
                  disabled={connecting || connected}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {connected ? 'Request Sent' : connecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            )}
          </div>

          {/* Bio text */}
          <div className="max-w-3xl space-y-3 pt-2">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {profile.bio || 'College student collaborating on software projects and learning new technologies.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-500">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  GitHub
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
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
                Earned Badges:
              </span>
              {(profile.profile?.badges || 'Student Explorer').split(',').map((b, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {b.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skills breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Skills {profile.name} Can Teach
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {teachSkills.map(s => (
              <SkillBadge key={s.id} name={s.skill.name} level={s.level} type="TEACH" />
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            Skills {profile.name} Wants to Learn
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {learnSkills.map(s => (
              <SkillBadge key={s.id} name={s.skill.name} level={s.level} type="LEARN" />
            ))}
          </div>
        </div>
      </div>

      {/* Showcase Portfolio */}
      {profile.portfolioProjects?.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Verified Portfolio Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.portfolioProjects.map(proj => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
              >
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{proj.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{proj.description}</p>
                <p className="text-[11px] font-semibold text-indigo-600">{proj.techStack}</p>
                <div className="flex items-center gap-3 pt-2">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      Repository
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live Application
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
