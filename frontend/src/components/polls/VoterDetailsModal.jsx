import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';

export default function VoterDetailsModal({ poll, onClose }) {
  const [activeTab, setActiveTab] = useState(poll.options?.[0]?.id || 1);

  const votersList = poll.votersList || [];
  const totalVotersCount = votersList.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="card max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden p-0"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-xs uppercase font-semibold text-emerald-200 tracking-wider">
              WhatsApp Poll Details
            </span>
            <h2 className="text-lg font-display font-bold leading-snug line-clamp-2">
              {poll.question}
            </h2>
            <p className="text-xs text-emerald-100 mt-1 flex items-center gap-2">
              <span><FiUsers size={12} className="inline mr-1" />{totalVotersCount} student{totalVotersCount !== 1 ? 's' : ''} responded</span>
              {poll.allowMultiple && <span className="bg-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-medium">Multiple answers allowed</span>}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Option Tabs */}
        <div className="flex overflow-x-auto border-b border-dark-100 dark:border-dark-800 bg-dark-50 dark:bg-dark-900/50 p-2 gap-2 flex-shrink-0">
          {(poll.options || []).map((option, idx) => {
            const optText = typeof option === 'string' ? option : (option?.text || `Option ${idx + 1}`);
            const optId = typeof option === 'string' ? idx + 1 : (option?.id || idx + 1);
            const votesCount = votersList.filter((v) => (v.optionIds || []).includes(optId)).length;
            const isActive = activeTab === optId;

            return (
              <button
                key={optId}
                onClick={() => setActiveTab(optId)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
                }`}
              >
                <span>{optText}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-400'}`}>
                  {votesCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Voter List for Active Tab */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {(() => {
            const currentOption = (poll.options || []).find((o, idx) => {
              const optId = typeof o === 'string' ? idx + 1 : (o?.id || idx + 1);
              return optId === activeTab;
            });
            const currentOptText = typeof currentOption === 'string' ? currentOption : (currentOption?.text || `Option ${activeTab}`);
            const optionVoters = votersList.filter((v) => (v.optionIds || []).includes(activeTab));

            if (!currentOption) return null;

            return (
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-dark-100 dark:border-dark-800">
                  <h3 className="font-bold text-dark-900 dark:text-white text-sm">
                    Voters for: "{currentOptText}"
                  </h3>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {optionVoters.length} Vote{optionVoters.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {optionVoters.length === 0 ? (
                  <div className="py-8 text-center text-dark-400 text-sm">
                    No students have voted for this option yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {optionVoters.map((voter, index) => {
                      const initial = (voter.userName || 'S').charAt(0).toUpperCase();
                      const votedTime = voter.timestamp ? new Date(voter.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800/40 border border-dark-100 dark:border-dark-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                              {initial}
                            </div>
                            <div>
                              <p className="font-semibold text-dark-900 dark:text-white text-sm">
                                {voter.userName || 'Student User'}
                              </p>
                              <p className="text-xs text-dark-400">Student</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <FiCheckCircle size={12} /> Voted
                            </span>
                            {votedTime && <p className="text-[10px] text-dark-400">{votedTime}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-900/30 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs py-2 px-4">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
