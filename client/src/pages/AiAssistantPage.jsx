import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  Sparkles,
  Send,
  Code2,
  Compass,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Cpu
} from 'lucide-react';

export default function AiAssistantPage() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState('chat'); // 'chat', 'roadmap', 'projects'
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `### 👋 Welcome to SkillBridge AI Learning Assistant!

I am your personal AI engineering mentor and software architect. I can help you:
- 🗺️ **Generate step-by-step learning roadmaps** for any language or framework
- 💡 **Brainstorm full-stack project ideas** tailored to your current skill level
- 🧠 **Explain complex programming concepts** with clear analogies and practical code
- 💻 **Recommend practice coding tasks** to test your knowledge

Feel free to pick one of the suggested prompts below or ask any question!`,
      provider: 'SkillBridge Assistant'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Roadmap generator state
  const [roadmapSkill, setRoadmapSkill] = useState('React & Modern Frontend');
  const [roadmapLevel, setRoadmapLevel] = useState('Beginner');
  const [roadmapWeeks, setRoadmapWeeks] = useState(4);

  // Project generator state
  const [projectTech, setProjectTech] = useState('React, Python, PostgreSQL');
  const [projectLevel, setProjectLevel] = useState('Intermediate');

  const promptSuggestions = [
    'Generate a 4-week roadmap to master React and Tailwind CSS',
    'Suggest 3 full-stack project ideas combining Python and React',
    'Explain the difference between SQL and NoSQL databases with examples',
    'How do WebSockets and Socket.IO work under the hood?'
  ];

  const handleSendMessage = async (customPrompt) => {
    const text = customPrompt || inputPrompt;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { prompt: text.trim() });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.data.content,
            provider: res.data.data.provider,
            isFallback: res.data.data.isFallback
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your request. Please try again.',
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!roadmapSkill.trim() || loading) return;

    setLoading(true);
    const userMessage = {
      role: 'user',
      content: `Create a ${roadmapWeeks}-week ${roadmapLevel} roadmap for ${roadmapSkill}.`
    };
    setMessages((prev) => [...prev, userMessage]);
    setActiveMode('chat');

    try {
      const res = await api.post('/ai/roadmap', {
        targetSkill: roadmapSkill,
        currentLevel: roadmapLevel,
        durationWeeks: roadmapWeeks
      });

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.data.content,
            provider: res.data.data.provider,
            isFallback: res.data.data.isFallback
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProjects = async (e) => {
    e.preventDefault();
    if (!projectTech.trim() || loading) return;

    setLoading(true);
    const skillsArray = projectTech.split(',').map((s) => s.trim());
    const userMessage = {
      role: 'user',
      content: `Suggest collaborative ${projectLevel} project ideas for: ${projectTech}.`
    };
    setMessages((prev) => [...prev, userMessage]);
    setActiveMode('chat');

    try {
      const res = await api.post('/ai/projects', {
        skills: skillsArray,
        difficulty: projectLevel
      });

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.data.content,
            provider: res.data.data.provider,
            isFallback: res.data.data.isFallback
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Render markdown text formatting cleanly
  const renderFormattedMarkdown = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-3 mb-1">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-700 dark:text-slate-300 my-0.5">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.startsWith('```')) {
        return null; // code block tag handled or rendered simply
      }
      return (
        <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            SkillBridge AI Learning Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Integrated peer mentoring assistant powered by AI for personalized roadmaps, project suggestions, and code explanations.
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 self-start md:self-auto">
          <button
            onClick={() => setActiveMode('chat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'chat'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Assistant Chat
          </button>
          <button
            onClick={() => setActiveMode('roadmap')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'roadmap'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Roadmap Builder
          </button>
          <button
            onClick={() => setActiveMode('projects')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'projects'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Project Generator
          </button>
        </div>
      </div>

      {/* Mode 2: Roadmap Generator Form */}
      {activeMode === 'roadmap' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Compass className="w-5 h-5" />
            <h3>Generate a Personalized Learning Curriculum</h3>
          </div>
          <p className="text-xs text-slate-500">
            Customize the duration and depth of study. SkillBridge AI will format a week-by-week learning syllabus.
          </p>

          <form onSubmit={handleGenerateRoadmap} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Target Skill or Framework
              </label>
              <input
                type="text"
                required
                value={roadmapSkill}
                onChange={(e) => setRoadmapSkill(e.target.value)}
                placeholder="e.g. React & Next.js, Django & PostgreSQL, Flutter"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Current Level
                </label>
                <select
                  value={roadmapLevel}
                  onChange={(e) => setRoadmapLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Complete Beginner">Complete Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced Developer">Advanced Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Duration (Weeks)
                </label>
                <select
                  value={roadmapWeeks}
                  onChange={(e) => setRoadmapWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={2}>2 Weeks (Intensive)</option>
                  <option value={4}>4 Weeks (Standard)</option>
                  <option value={8}>8 Weeks (Deep Dive)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Roadmap Now
            </button>
          </form>
        </div>
      )}

      {/* Mode 3: Project Idea Generator Form */}
      {activeMode === 'projects' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
            <Lightbulb className="w-5 h-5" />
            <h3>Collaborative Project Idea Generator</h3>
          </div>
          <p className="text-xs text-slate-500">
            Tell the AI what technologies you and your peer partner know. The assistant will produce structured project concepts.
          </p>

          <form onSubmit={handleGenerateProjects} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Combined Technologies / Tech Stack
              </label>
              <input
                type="text"
                required
                value={projectTech}
                onChange={(e) => setProjectTech(e.target.value)}
                placeholder="e.g. React, Node.js, Express, PostgreSQL"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Project Scope / Difficulty
              </label>
              <select
                value={projectLevel}
                onChange={(e) => setProjectLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Beginner friendly">Beginner friendly</option>
                <option value="Intermediate portfolio grade">Intermediate portfolio grade</option>
                <option value="Advanced production ready">Advanced production ready</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-purple-500/20 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Project Ideas
            </button>
          </form>
        </div>
      )}

      {/* Mode 1: Main Conversational Assistant Chat */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((m, idx) => {
            const isMe = m.role === 'user';

            return (
              <div
                key={idx}
                className={`flex items-start gap-3.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {isMe ? (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-bl-xs border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {!isMe && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {m.provider || 'SkillBridge AI'}
                        </span>
                        {m.isFallback && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-medium">
                            Offline Mode
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(m.content, idx)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  <div className="space-y-1">
                    {isMe ? (
                      <p className="text-xs whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      renderFormattedMarkdown(m.content)
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Assistant is formulating an answer...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions bar */}
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2 overflow-x-auto">
          {promptSuggestions.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 px-3 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask a technical question, ask for code explanation, or request a roadmap..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
