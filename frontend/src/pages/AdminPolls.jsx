import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiTrash2, FiClock, FiCheckCircle, FiBarChart2,
  FiAward, FiX, FiCheck, FiSend, FiInfo, FiEye
} from 'react-icons/fi';
import { pollService } from '../services/pollService';
import { useAuth } from '../context/AuthContext';
import VoterDetailsModal from '../components/polls/VoterDetailsModal';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminPolls() {
  const { user } = useAuth();
  const [activePolls, setActivePolls] = useState([]);
  const [pollResults, setPollResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('Menu Suggestion');
  const [options, setOptions] = useState(['', '']);
  const [durationHours, setDurationHours] = useState('24');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Voter details modal
  const [viewingVotesPoll, setViewingVotesPoll] = useState(null);

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, resultsRes] = await Promise.all([
        pollService.getActivePolls(),
        pollService.getPollResults(),
      ]);
      setActivePolls(Array.isArray(activeRes.data) ? activeRes.data : []);
      setPollResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
    } catch (err) {
      console.error('Failed to load polls:', err);
      toast.error('Failed to load polls data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
    const handleUpdate = () => fetchPolls();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchPolls]);

  const handleAddOption = () => {
    if (options.length >= 6) {
      toast.error('Maximum 6 options allowed per poll');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      toast.error('At least 2 options are required');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const cleanQuestion = question.trim();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!cleanQuestion) {
      toast.error('Please enter a poll question');
      return;
    }
    if (cleanOptions.length < 2) {
      toast.error('Please provide at least 2 non-empty options');
      return;
    }

    setSubmitting(true);
    try {
      const expiresAt = new Date(Date.now() + Number(durationHours) * 60 * 60 * 1000).toISOString();
      await pollService.createPoll({
        question: cleanQuestion,
        category,
        options: cleanOptions,
        allowMultiple,
        expiresAt,
        createdBy: user?.name || 'Mess Secretary',
      });

      toast.success('New WhatsApp-style poll published live for students!');
      setIsModalOpen(false);
      setQuestion('');
      setCategory('Menu Suggestion');
      setOptions(['', '']);
      setDurationHours('24');
      setAllowMultiple(false);
      fetchPolls();
    } catch (err) {
      toast.error('Failed to create poll');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to permanently delete this poll? It will be removed immediately from all student profiles and dashboards.')) return;

    try {
      await pollService.deletePoll(pollId);
      toast.success('Poll permanently deleted from all student profiles!');
      fetchPolls();
    } catch (err) {
      toast.error('Failed to delete poll');
    }
  };

  const handleFinishAndDeletePoll = async (pollId) => {
    if (!window.confirm('End this poll now? The final vote results will be saved to Poll Results before removing the active poll.')) return;

    try {
      await pollService.finishAndDeletePoll(pollId);
      toast.success('Poll finished! Results saved to student profiles archive.');
      fetchPolls();
    } catch (err) {
      toast.error('Failed to finish poll');
    }
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Delete this archived poll result? It will be removed from all student profiles.')) return;
    try {
      await pollService.deletePollResult(resultId);
      toast.success('Archived result removed from all student profiles!');
      fetchPolls();
    } catch (err) {
      toast.error('Failed to delete result');
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-3">
                <FiBarChart2 size={14} /> WhatsApp Polling Manager
              </span>
              <h1 className="section-title text-left">Student Polling Management</h1>
              <p className="section-subtitle text-left mt-1">
                Create interactive polls, allow multiple answers, view live student votes breakdown, and store results.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-none text-white flex items-center gap-2 self-start md:self-auto shadow-lg shadow-emerald-500/25"
            >
              <FiPlus size={18} /> Create New Poll
            </button>
          </div>
        </motion.div>

        {/* ACTIVE POLLS SECTION */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-dark-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              Active Polls ({activePolls.length})
            </h2>
          </div>

          {loading ? (
            <div className="card p-10 text-center text-dark-500">Loading polls...</div>
          ) : activePolls.length === 0 ? (
            <div className="card p-10 text-center text-dark-500 dark:text-dark-400 border border-dashed border-dark-200 dark:border-dark-700">
              <span className="text-4xl mb-3 block">🗳️</span>
              <h3 className="text-lg font-bold text-dark-900 dark:text-white">No active student polls</h3>
              <p className="text-sm text-dark-400 mt-1 mb-4">Click "Create New Poll" to post a question for students to vote on.</p>
              <button onClick={() => setIsModalOpen(true)} className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-none text-white text-sm inline-flex items-center gap-2">
                <FiPlus size={16} /> Create First Poll
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePolls.map((poll) => {
                const totalVotes = (poll.options || []).reduce((sum, o) => sum + (o.votes || 0), 0);
                const expiryDate = poll.expiresAt ? new Date(poll.expiresAt).toLocaleString() : 'N/A';
                const totalVotersCount = (poll.votersList || []).length;

                return (
                  <motion.div key={poll.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 border border-dark-200 dark:border-dark-800">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="badge-primary text-xs">{poll.category || 'General'}</span>
                        {poll.allowMultiple && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold px-2 py-0.5 rounded">Multi-Select</span>}
                      </div>
                      <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">
                        <FiClock size={13} /> Expires: {expiryDate}
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-4">
                      {poll.question}
                    </h3>

                    {/* Options Breakdown */}
                    <div className="space-y-3 mb-6">
                      {(poll.options || []).map((option, idx) => {
                        const optText = typeof option === 'string' ? option : (option?.text || `Option ${idx + 1}`);
                        const optId = typeof option === 'string' ? idx + 1 : (option?.id || idx + 1);
                        const votes = typeof option === 'string' ? 0 : (option?.votes || 0);
                        const pct = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
                        return (
                          <div key={optId} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/10 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                {optText}
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{pct}% ({votes} votes)</span>
                            </div>
                            <div className="h-2.5 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                              <div style={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-dark-100 dark:border-dark-800 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-dark-500 font-medium">
                        {totalVotersCount} Student{totalVotersCount !== 1 ? 's' : ''} Voted ({totalVotes} total selections)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingVotesPoll(poll)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <FiEye size={14} /> View Votes
                        </button>
                        <button
                          onClick={() => handleFinishAndDeletePoll(poll.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Finish poll & save result before deleting"
                        >
                          <FiCheckCircle size={14} /> End & Store Result
                        </button>
                        <button
                          onClick={() => handleDirectDeletePoll(poll.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Delete poll immediately from all student profiles"
                        >
                          <FiTrash2 size={14} /> Delete Poll
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ARCHIVED RESULTS SECTION */}
        <div>
          <h2 className="text-2xl font-display font-bold text-dark-900 dark:text-white flex items-center gap-2 mb-6">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <FiAward size={20} />
            </span>
            Historical Stored Poll Results ({pollResults.length})
          </h2>

          {pollResults.length === 0 ? (
            <div className="card p-6 text-center text-dark-400 text-sm">
              No finished poll results in history yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pollResults.map((result) => (
                <div key={result.id} className="card p-6 border border-dark-200 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-900/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="badge-secondary text-xs">{result.category}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingVotesPoll(result)}
                        className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-medium flex items-center gap-1"
                      >
                        <FiEye size={13} /> View Votes
                      </button>
                      <button onClick={() => handleDeleteResult(result.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete Archive Entry">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-dark-900 dark:text-white text-base mb-3">{result.question}</h3>
                  <div className="space-y-2 text-xs">
                    {(result.options || []).map((o) => (
                      <div key={o.id || o.text} className="flex justify-between">
                        <span>{o.text}</span>
                        <span className="font-bold">{o.percentage}% ({o.votes} votes)</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-dark-400 mt-4 pt-2 border-t border-dark-100 dark:border-dark-800">
                    Ended: {result.endedAt ? new Date(result.endedAt).toLocaleDateString() : 'Finished'} • Total Votes: {result.totalVotes}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE POLL MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-dark-100 dark:border-dark-800 mb-6">
                <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white flex items-center gap-2">
                  💬 Create WhatsApp Poll
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-dark-400 hover:text-dark-600">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleCreatePoll} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Poll Question / Query *</label>
                  <input
                    type="text"
                    placeholder="e.g. Which special dish should we serve this Sunday?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                      <option value="Menu Suggestion">Menu Suggestion</option>
                      <option value="Mess Timings">Mess Timings</option>
                      <option value="Food Quality">Food Quality</option>
                      <option value="Special Event">Special Event</option>
                      <option value="General Query">General Query</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Duration (Hours)</label>
                    <select value={durationHours} onChange={(e) => setDurationHours(e.target.value)} className="input-field">
                      <option value="2">2 Hours</option>
                      <option value="6">6 Hours</option>
                      <option value="12">12 Hours</option>
                      <option value="24">24 Hours (1 Day)</option>
                      <option value="48">48 Hours (2 Days)</option>
                      <option value="72">72 Hours (3 Days)</option>
                    </select>
                  </div>
                </div>

                {/* WhatsApp Style Multi-Select Toggle */}
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Allow multiple answers</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">Students can select more than one option</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowMultiple}
                    onChange={(e) => setAllowMultiple(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Poll Options *</label>
                    <button type="button" onClick={handleAddOption} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                      <FiPlus size={14} /> Add Option
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 text-xs text-dark-400 font-bold">{idx + 1}.</span>
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1}...`}
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className="input-field text-sm flex-1"
                          required
                        />
                        {options.length > 2 && (
                          <button type="button" onClick={() => handleRemoveOption(idx)} className="p-2 text-red-500 hover:text-red-700">
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 dark:border-dark-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-none text-white flex items-center gap-2">
                    <FiSend size={16} /> {submitting ? 'Launching...' : 'Launch WhatsApp Poll'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VOTER DETAILS MODAL */}
      <AnimatePresence>
        {viewingVotesPoll && (
          <VoterDetailsModal
            poll={viewingVotesPoll}
            onClose={() => setViewingVotesPoll(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
