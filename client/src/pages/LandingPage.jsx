import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Users2,
  FolderGit2,
  Bot,
  MessageSquare,
  Award,
  CheckCircle2,
  Zap,
  GraduationCap
} from 'lucide-react';

export default function LandingPage() {
  const [simulatorKnown, setSimulatorKnown] = useState('Python');
  const [simulatorWant, setSimulatorWant] = useState('React');

  const sampleSkills = ['Python', 'React', 'TypeScript', 'Flutter', 'UI/UX Design', 'Machine Learning', 'Node.js', 'PostgreSQL'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Background decorative gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Campus Skill Exchange & Project Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Learn Together.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
                Build Together.
              </span>{' '}
              Grow Together.
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Connect with fellow college students to trade skills 1-on-1, co-create real-world software projects, and supercharge your career with an integrated AI learning assistant.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Find Your Learning Partner</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-800 shadow-xs transition-colors flex items-center justify-center"
              >
                Sign In to Platform
              </Link>
            </div>
          </div>

          {/* Interactive Live Skill Match Simulator */}
          <div className="mt-16 max-w-4xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Live Skill Exchange Simulator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select what you know and what you want to master to see how SkillBridge pairs students!
                </p>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Algorithm Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Selector controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    1. A Skill You Can Teach / Share:
                  </label>
                  <select
                    value={simulatorKnown}
                    onChange={(e) => setSimulatorKnown(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {sampleSkills.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    2. A Skill You Want to Learn:
                  </label>
                  <select
                    value={simulatorWant}
                    onChange={(e) => setSimulatorWant(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {sampleSkills.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Match Simulator Result Card */}
              <div className="rounded-xl p-5 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-emerald-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-emerald-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                      alt="Matched Partner"
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Priya Sharma</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Stanford Engineering</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs">
                      95% Match
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Priya teaches:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{simulatorWant} (Expert)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Priya wants to learn:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{simulatorKnown} (Beginner)</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to="/register"
                    className="block text-center w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                  >
                    Connect with Matched Students
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              How SkillBridge Works
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm">
              From finding your ideal peer mentor to shipping complete portfolio projects together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'List Your Skills',
                desc: 'Add the programming languages and frameworks you know, plus what you want to learn next.',
                icon: Code2
              },
              {
                step: '02',
                title: 'Get Matched',
                desc: 'Our reciprocal matchmaking algorithm finds students with complementary teach/learn goals.',
                icon: Users2
              },
              {
                step: '03',
                title: 'Collaborate on Projects',
                desc: 'Create team projects, divide tasks on Kanban boards, and chat in real-time.',
                icon: FolderGit2
              },
              {
                step: '04',
                title: 'Build Your Portfolio',
                desc: 'Earn badges, showcase verified project deliverables, and prepare for tech job interviews.',
                icon: Award
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-lg"
                >
                  <span className="text-3xl font-black text-indigo-200 dark:text-indigo-900/70 block mb-3">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Built for Campus Success
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Everything Students Need to Succeed
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm">
              All tools unified in a modern, accessible, dark-mode ready workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reciprocal Matchmaking</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Smart compatibility scores based on overlapping skills, college affiliation, and learning milestones so you never learn alone.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> College & skill level filters</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Personalized connection notes</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Project Collaboration & Kanban</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Turn ideas into tangible software. Assign tasks (To Do, In Progress, Done), manage deadlines, and track completion progress.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Interactive Kanban boards</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Team member invites & roles</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Learning Assistant</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Powered by Google Gemini with an offline fallback engine. Generates 4-week roadmaps, project architectures, and code explanations.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant curriculum roadmaps</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Code syntax breakdown & katas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Stats Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold">2000+</p>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 font-medium">Student Connections</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold">450+</p>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 font-medium">Shipped Projects</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold">95%</p>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 font-medium">Match Satisfaction</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold">25+</p>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 font-medium">Universities Represented</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer Section */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <GraduationCap className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Ready to Exchange Skills & Build Together?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Join students from top colleges today. Free to register, collaborate, and learn.
          </p>
          <div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              <span>Create Your Student Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">SkillBridge</span>
            <span>&copy; {new Date().getFullYear()} Student Skill Exchange & Project Collaboration Platform.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/skills" className="hover:text-indigo-600">Explore Skills</Link>
            <Link to="/login" className="hover:text-indigo-600">Student Login</Link>
            <Link to="/register" className="hover:text-indigo-600">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
