import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle, FiClock, FiBarChart2, FiAward, FiTrash2,
  FiCheckSquare, FiUserCheck, FiEye, FiEdit2, FiCheck, FiUsers
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { pollService } from '../../services/pollService';
import VoterDetailsModal from './VoterDetailsModal';
import toast from 'react-hot-toast';

export default function StudentPollsWidget({ showResultsOnly = false, limitActive = 0 }) {
  const { user, isAdmin } = useAuth();
  const userId = user?.id || user?.email || 'student_user';
  const userName = user?.name || 'Student User';

  const [activePolls, setActivePolls] = useState([]);
  const [pollResults, setPollResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected options state: { [pollId]: [optionId1, optionId2] }
  const [selectedOptionsMap, setSelectedOptionsMap] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  // State to control editing existing vote
  const [editingPolls, setEditingPolls] = useState({});
  // State for Voter Details Modal
  const [viewingVotesPoll, setViewingVotesPoll] = useState(null);

  const fetchPollsData = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, resultsRes] = await Promise.all([
        pollService.getActivePolls(),
        pollService.getPollResults(),
      ]);
      const fetchedActive = Array.isArray(activeRes.data) ? activeRes.data : [];
      setActivePolls(fetchedActive);
      setPollResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);

      // Pre-fill user's existing selections if they already voted
      const initialMap = {};
      fetchedActive.forEach((poll) => {
        const userVoteRecord = (poll.votersList || []).find((v) => v.userId === userId);
        if (userVoteRecord && userVoteRecord.optionIds) {
          initialMap[poll.id] = userVoteRecord.optionIds;
        }
      });
      setSelectedOptionsMap((prev) => ({ ...initialMap, ...prev }));
    } catch (err) {
      console.error('Failed to load polls data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPollsData();
    const handleUpdate = () => fetchPollsData();
    window.addEventListener('nmms-storage-update', handleUpdate);
    return () => window.removeEventListener('nmms-storage-update', handleUpdate);
  }, [fetchPollsData]);

  const handleOptionToggle = (poll, optionId) => {
    const currentSelections = selectedOptionsMap[poll.id] || [];

    if (poll.allowMultiple) {
      // Toggle in array
      if (currentSelections.includes(optionId)) {
        setSelectedOptionsMap({
          ...selectedOptionsMap,
          [poll.id]: currentSelections.filter((id) => id !== optionId),
        });
      } else {
        setSelectedOptionsMap({
          ...selectedOptionsMap,
          [poll.id]: [...currentSelections, optionId],
        });
      }
    } else {
      // Single selection
      setSelectedOptionsMap({
        ...selectedOptionsMap,
        [poll.id]: [optionId],
      });
    }
  };

  const handleVoteSubmit = async (poll) => {
    const selected = selectedOptionsMap[poll.id] || [];
    if (selected.length === 0) {
      toast.error('Please select at least one option');
      return;
    }

    setSubmittingId(poll.id);
    try {
      await pollService.votePoll(poll.id, selected, userId, userName);
      toast.success('Your vote has been updated!');
      setEditingPolls({ ...editingPolls, [poll.id]: false });
      fetchPollsData();
    } catch (err) {
      toast.error('Failed to submit vote');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this historical poll result?')) return;
    try {
      await pollService.deletePollResult(resultId);
      toast.success('Poll result deleted');
      fetchPollsData();
    } catch (err) {
      toast.error('Failed to delete poll result');
    }
  };

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'Active';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;

    if (diffMs <= 0) return 'Expired';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    if (hours > 0) {
      return `${hours}h ${mins}m left`;
    }
    return `${mins}m left`;
  };

  const displayedActivePolls = limitActive > 0 ? activePolls.slice(0, limitActive) : activePolls;

  if (loading) {
    return (
      <div className="card p-6 text-center text-dark-500 animate-pulse">
        Loading student polls...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── ACTIVE POLLS SECTION ─── */}
      {!showResultsOnly && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <FiBarChart2 size={20} />
              </span>
              WhatsApp Student Polls
            </h2>
            {activePolls.length > 0 && (
              <span className="badge-primary bg-emerald-600 border-none text-white">
                {activePolls.length} Active Poll{activePolls.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {displayedActivePolls.length === 0 ? (
            <div className="card p-6 text-center text-dark-500 dark:text-dark-400 border border-dashed border-dark-200 dark:border-dark-700">
              <FiCheckSquare size={32} className="mx-auto mb-2 opacity-50 text-emerald-500" />
              <p className="font-medium">No active polls right now.</p>
              <p className="text-xs mt-1 text-dark-400">Check back later or view archived poll results below!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {displayedActivePolls.map((poll) => {
                const userVoted = (poll.votedUsers || []).includes(userId);
                const isEditing = editingPolls[poll.id];
                const showVotingUI = !userVoted || isEditing;

                const totalVotes = (poll.options || []).reduce((sum, o) => sum + (o.votes || 0), 0);
                const timeLeft = getTimeRemaining(poll.expiresAt);
                const userVoteRecord = (poll.votersList || []).find((v) => v.userId === userId);
                const userSelectedOptionIds = userVoteRecord?.optionIds || selectedOptionsMap[poll.id] || [];

                return (
                  <motion.div
                    key={poll.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 border border-emerald-500/20 dark:border-emerald-500/10 shadow-lg shadow-emerald-500/5 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {poll.category || 'General Poll'}
                        </span>
                        {poll.allowMultiple && (
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            Select one or more
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">
                        <FiClock size={13} /> {timeLeft}
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-4">
                      {poll.question}
                    </h3>

                    {!showVotingUI ? (
                      /* ─── Voted State: WhatsApp Results & Avatars ─── */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                            <FiCheckCircle size={14} /> You responded
                          </div>
                          <button
                            onClick={() => setEditingPolls({ ...editingPolls, [poll.id]: true })}
                            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <FiEdit2 size={13} /> Change Vote
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(poll.options || []).map((option, idx) => {
                            const optText = typeof option === 'string' ? option : (option?.text || `Option ${idx + 1}`);
                            const optId = typeof option === 'string' ? idx + 1 : (option?.id || idx + 1);
                            const votes = typeof option === 'string' ? 0 : (option?.votes || 0);
                            const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
                            const isUserChoice = userSelectedOptionIds.includes(optId);

                            // Find voters for this option
                            const optionVoters = (poll.votersList || []).filter((v) => (v.optionIds || []).includes(optId));

                            return (
                              <div
                                key={optId}
                                className={`p-3.5 rounded-xl border transition-all ${
                                  isUserChoice
                                    ? 'border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20'
                                    : 'border-dark-100 dark:border-dark-800'
                                }`}
                              >
                                <div className="flex justify-between items-center text-sm font-medium mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                                      {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    {isUserChoice && <span className="text-emerald-500 font-bold">✓</span>}
                                    <span className={isUserChoice ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-dark-800 dark:text-dark-200'}>
                                      {optText}
                                    </span>
                                  </div>
                                  <span className="text-dark-600 dark:text-dark-400 font-bold text-xs">
                                    {percentage}% ({votes})
                                  </span>
                                </div>

                                <div className="h-2.5 w-full bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden mb-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.7 }}
                                    className={`h-full rounded-full ${
                                      isUserChoice
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                        : 'bg-dark-400 dark:bg-dark-600'
                                    }`}
                                  />
                                </div>

                                {/* Stacked Voter Avatars */}
                                {optionVoters.length > 0 && (
                                  <div className="flex items-center gap-1.5 pt-1">
                                    <div className="flex -space-x-2 overflow-hidden">
                                      {optionVoters.slice(0, 5).map((voter, vIdx) => (
                                        <div
                                          key={vIdx}
                                          title={voter.userName}
                                          className="inline-block h-6 w-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-[10px] text-center leading-6 ring-2 ring-white dark:ring-dark-900"
                                        >
                                          {(voter.userName || 'S').charAt(0).toUpperCase()}
                                        </div>
                                      ))}
                                    </div>
                                    <span className="text-[11px] text-dark-500 dark:text-dark-400 font-medium">
                                      {optionVoters.slice(0, 2).map((v) => v.userName).join(', ')}
                                      {optionVoters.length > 2 ? ` +${optionVoters.length - 2} more` : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Poll Card Footer */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-dark-400 font-medium">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast</span>
                          <button
                            onClick={() => setViewingVotesPoll(poll)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <FiEye size={14} /> View Votes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ─── Voting Selection Mode ─── */
                      <div className="space-y-4">
                        <div className="space-y-2.5">
                          {(poll.options || []).map((option, idx) => {
                            const optText = typeof option === 'string' ? option : (option?.text || `Option ${idx + 1}`);
                            const optId = typeof option === 'string' ? idx + 1 : (option?.id || idx + 1);

                            const selectedArr = selectedOptionsMap[poll.id] || [];
                            const isChecked = selectedArr.includes(optId);

                            return (
                              <label
                                key={optId}
                                onClick={() => handleOptionToggle(poll, optId)}
                                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                                    : 'border-dark-200 dark:border-dark-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-dark-800 dark:text-dark-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-5 h-5 rounded-full bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 text-xs font-bold flex items-center justify-center">
                                    {String(idx + 1).padStart(2, '0')}
                                  </span>
                                  <div className={`w-5 h-5 rounded-${poll.allowMultiple ? 'md' : 'full'} border flex items-center justify-center transition-colors ${
                                    isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-dark-300 dark:border-dark-600'
                                  }`}>
                                    {isChecked && <FiCheck size={14} />}
                                  </div>
                                  <span className="text-sm font-semibold">{optText}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-dark-400">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                            <button
                              onClick={() => setViewingVotesPoll(poll)}
                              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:underline"
                            >
                              <FiEye size={13} /> View Votes
                            </button>
                          </div>

                          <div className="flex gap-2">
                            {userVoted && (
                              <button
                                onClick={() => setEditingPolls({ ...editingPolls, [poll.id]: false })}
                                className="btn-secondary text-xs py-2 px-3"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleVoteSubmit(poll)}
                              disabled={submittingId === poll.id || (selectedOptionsMap[poll.id] || []).length === 0}
                              className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-none text-white text-sm py-2 px-5 disabled:opacity-50"
                            >
                              {submittingId === poll.id ? 'Saving...' : userVoted ? 'Update Vote' : 'Vote'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── ARCHIVED POLL RESULTS SECTION ─── */}
      <div className="space-y-4 pt-4 border-t border-dark-100 dark:border-dark-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <FiAward size={20} />
            </span>
            Archived Poll Results
          </h2>
          <span className="badge-secondary">{pollResults.length} Outcome{pollResults.length !== 1 ? 's' : ''}</span>
        </div>

        {pollResults.length === 0 ? (
          <div className="card p-6 text-center text-dark-400 text-sm">
            No completed poll results archived yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pollResults.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-6 bg-dark-50/50 dark:bg-dark-900/40 border border-dark-200 dark:border-dark-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="badge-primary text-xs">{result.category || 'Poll Result'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400">
                      Ended: {result.endedAt ? new Date(result.endedAt).toLocaleDateString() : 'Finished'}
                    </span>
                    <button
                      onClick={() => setViewingVotesPoll(result)}
                      className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-medium flex items-center gap-1"
                    >
                      <FiEye size={13} /> View Votes
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteResult(result.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Result"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-2">
                  {result.question}
                </h3>

                {/* Detailed Breakdown */}
                <div className="space-y-2.5">
                  {(result.options || []).map((opt) => (
                    <div key={opt.id || opt.text} className="space-y-1 text-sm">
                      <div className="flex justify-between font-medium">
                        <span className="font-semibold text-dark-800 dark:text-dark-200">
                          {opt.text}
                        </span>
                        <span className="text-dark-500 dark:text-dark-400 font-semibold">
                          {opt.percentage ?? 0}% ({opt.votes ?? 0} votes)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-dark-200 dark:bg-dark-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${opt.percentage ?? 0}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-dark-200 dark:border-dark-800 flex justify-between text-xs text-dark-400 font-medium">
                  <span>Total Votes: {result.totalVotes ?? 0}</span>
                  <span>Published by: {result.createdBy || 'Admin'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
