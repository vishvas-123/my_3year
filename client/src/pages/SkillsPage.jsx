import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { SkillBadge } from '../components/Badge';
import confetti from 'canvas-confetti';
import {
  Search,
  Filter,
  Sparkles,
  Users2,
  Send,
  Check,
  X,
  MessageSquare,
  Loader2,
  Clock,
  UserCheck
} from 'lucide-react';

export default function SkillsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('find'); // 'find', 'connected', 'requests'
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState({ accepted: [], pendingReceived: [], pendingSent: [] });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Connect modal
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [connectionNote, setConnectionNote] = useState('');
  const [submittingConnect, setSubmittingConnect] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchConnections();
  }, [collegeFilter, levelFilter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.skill = searchQuery;
      if (collegeFilter) params.college = collegeFilter;
      if (levelFilter) params.level = levelFilter;

      const res = await api.get('/skills/matches', { params });
      if (res.data.success) {
        setMatches(res.data.matches);
      }
    } catch (err) {
      console.error('Failed to fetch skill matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await api.get('/connections');
      if (res.data.success) {
        setConnections({
          accepted: res.data.accepted,
          pendingReceived: res.data.pendingReceived,
          pendingSent: res.data.pendingSent
        });
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMatches();
  };

  const openConnectModal = (match) => {
    setSelectedPartner(match);
    setConnectionNote(
      `Hi ${match.user.name.split(' ')[0]}! I noticed your profile on SkillBridge and would love to collaborate on skill exchange.`
    );
  };

  const handleSendRequest = async () => {
    if (!selectedPartner) return;
    try {
      setSubmittingConnect(true);
      const res = await api.post('/connections/request', {
        receiverId: selectedPartner.user.id,
        note: connectionNote
      });

      if (res.data.success) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        setMatches(prev =>
          prev.map(m =>
            m.user.id === selectedPartner.user.id ? { ...m, connectionStatus: 'PENDING' } : m
          )
        );
        setSelectedPartner(null);
        fetchConnections();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmittingConnect(false);
    }
  };

  const handleRespondRequest = async (connectionId, action) => {
    try {
      const res = await api.post(`/connections/${connectionId}/respond`, { action });
      if (res.data.success) {
        if (action === 'ACCEPT') {
          confetti({ particleCount: 60, spread: 70 });
        }
        fetchConnections();
        fetchMatches();
      }
    } catch (err) {
      console.error('Error responding to request:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Skill Exchange & Partner Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover peer learning partners with reciprocal skills and complementary learning goals.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('find')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'find'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Find Partners ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('connected')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'connected'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Connected ({connections.accepted.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Requests ({connections.pendingReceived.length + connections.pendingSent.length})
            {connections.pendingReceived.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'find' && (
        <>
          {/* Search & Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by skill name (e.g. React, Python, Flutter)..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={collegeFilter}
                  onChange={(e) => setCollegeFilter(e.target.value)}
                  placeholder="Filter by college..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Levels</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filter
                </button>
              </div>
            </form>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : matches.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No matching students found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing your search query or college filter to see more students from other universities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => {
                const partner = match.user;
                return (
                  <div
                    key={partner.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top bar with avatar & score */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Link to={`/profile/${partner.id}`}>
                            {partner.avatar ? (
                              <img
                                src={partner.avatar}
                                alt={partner.name}
                                className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                                {partner.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </Link>
                          <div>
                            <Link
                              to={`/profile/${partner.id}`}
                              className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                            >
                              {partner.name}
                            </Link>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                              {partner.college || 'College Student'}
                            </p>
                          </div>
                        </div>

                        {/* Match score pill */}
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs">
                          {match.matchScore}%
                        </span>
                      </div>

                      {/* Bio */}
                      {partner.bio && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {partner.bio}
                        </p>
                      )}

                      {/* Skills Breakdown */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                            Skills They Teach:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {match.teachSkills.length > 0 ? (
                              match.teachSkills.map((s) => (
                                <SkillBadge key={s.name} name={s.name} level={s.level} type="TEACH" />
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400">None listed</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                            Skills They Want to Learn:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {match.learnSkills.length > 0 ? (
                              match.learnSkills.map((s) => (
                                <SkillBadge key={s.name} name={s.name} level={s.level} type="LEARN" />
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400">None listed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Link
                        to={`/profile/${partner.id}`}
                        className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        Public Profile
                      </Link>

                      {match.connectionStatus === 'ACCEPTED' ? (
                        <Link
                          to={`/chat?userId=${partner.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </Link>
                      ) : match.connectionStatus === 'PENDING' ? (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => openConnectModal(match)}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Connected Tab */}
      {activeTab === 'connected' && (
        <div className="space-y-4">
          {connections.accepted.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No active connections yet</p>
              <p className="text-xs text-slate-500">Search for skill partners in the Find tab and send connection requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.accepted.map((conn) => {
                const partner = conn.partner;
                return (
                  <div
                    key={conn.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      {partner.avatar ? (
                        <img
                          src={partner.avatar}
                          alt={partner.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                          {partner.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{partner.name}</h3>
                        <p className="text-xs text-slate-500 truncate max-w-[180px]">{partner.college || 'Student'}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Connected
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        to={`/chat?userId=${partner.id}`}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Start Chat
                      </Link>
                      <Link
                        to={`/profile/${partner.id}`}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Received Requests */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Received Requests ({connections.pendingReceived.length})
            </h2>
            {connections.pendingReceived.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                No incoming connection requests.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.pendingReceived.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      {req.partner.avatar ? (
                        <img
                          src={req.partner.avatar}
                          alt={req.partner.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {req.partner.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.partner.name}</h4>
                        <p className="text-xs text-slate-500">{req.partner.college || 'Student'}</p>
                      </div>
                    </div>

                    {req.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        "{req.note}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleRespondRequest(req.id, 'ACCEPT')}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req.id, 'REJECT')}
                        className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Requests */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Sent Requests ({connections.pendingSent.length})
            </h2>
            {connections.pendingSent.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                No outgoing requests awaiting response.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.pendingSent.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {req.partner.avatar ? (
                        <img
                          src={req.partner.avatar}
                          alt={req.partner.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {req.partner.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{req.partner.name}</h4>
                        <p className="text-[11px] text-slate-500">{req.partner.college || 'Student'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Awaiting Response
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                Connect with {selectedPartner.user.name}
              </h3>
              <button
                onClick={() => setSelectedPartner(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Send a friendly note proposing a skill exchange or collaborative study partnership.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Personalized Note
              </label>
              <textarea
                rows={4}
                value={connectionNote}
                onChange={(e) => setConnectionNote(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendRequest}
                disabled={submittingConnect}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                {submittingConnect ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Invitation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
