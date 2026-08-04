// Centralized Dynamic Data Storage Engine with LocalStorage Persistence & File Seed Sync
import initialData from './initialData.json';

const STORAGE_KEYS = {
  MENU: 'nmms_dynamic_menu',
  ANNOUNCEMENTS: 'nmms_dynamic_announcements',
  COMPLAINTS: 'nmms_dynamic_complaints',
  FEEDBACK: 'nmms_dynamic_feedback',
  STAFF: 'nmms_dynamic_staff',
  GALLERY: 'nmms_dynamic_gallery',
  STUDENTS: 'nmms_dynamic_students',
  POLLS: 'nmms_dynamic_polls',
  POLL_RESULTS: 'nmms_dynamic_poll_results',
  POLL_RESULTS: 'nmms_dynamic_poll_results',
};

// Helper methods to read/write JSON safely from LocalStorage
const getStorageItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event to sync cross-component state updates in real-time
    window.dispatchEvent(new Event('nmms-storage-update'));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
};

export const dataStorage = {
  // ─── Menu Methods ───
  getMenu: () => getStorageItem(STORAGE_KEYS.MENU, initialData.menu),
  
  updateDayMenu: (day, updatedMealObj) => {
    const current = dataStorage.getMenu();
    const updated = {
      ...current,
      [day.toUpperCase()]: updatedMealObj,
    };
    setStorageItem(STORAGE_KEYS.MENU, updated);
    return updated;
  },

  // ─── Announcements Methods ───
  getAnnouncements: () => getStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, initialData.announcements),
  
  addAnnouncement: (announcement) => {
    const list = dataStorage.getAnnouncements();
    const newItem = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      priority: announcement.priority || 'normal',
      ...announcement,
    };
    const updated = [newItem, ...list];
    setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return newItem;
  },

  deleteAnnouncement: (id) => {
    const list = dataStorage.getAnnouncements();
    const updated = list.filter((item) => item.id !== id);
    setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return true;
  },

  // ─── Complaints Methods ───
  getComplaints: () => getStorageItem(STORAGE_KEYS.COMPLAINTS, []),

  addComplaint: (complaint) => {
    const list = dataStorage.getComplaints();
    const newItem = {
      id: Date.now(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      adminResponse: '',
      ...complaint,
    };
    const updated = [newItem, ...list];
    setStorageItem(STORAGE_KEYS.COMPLAINTS, updated);
    return newItem;
  },

  updateComplaintStatus: (id, status, adminResponse = '') => {
    const list = dataStorage.getComplaints();
    const updated = list.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status,
          adminResponse: adminResponse || item.adminResponse,
          resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : item.resolvedAt,
        };
      }
      return item;
    });
    setStorageItem(STORAGE_KEYS.COMPLAINTS, updated);
    return updated.find((item) => item.id === id);
  },

  // ─── Feedback Methods ───
  getFeedback: () => getStorageItem(STORAGE_KEYS.FEEDBACK, []),

  addFeedback: (feedback) => {
    const list = dataStorage.getFeedback();
    const newItem = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      week: `Week ${getWeekNumber(new Date())}`,
      ...feedback,
    };
    const updated = [newItem, ...list];
    setStorageItem(STORAGE_KEYS.FEEDBACK, updated);
    return newItem;
  },

  // ─── Staff Methods ───
  getStaff: () => getStorageItem(STORAGE_KEYS.STAFF, initialData.staff),

  addStaff: (staffMember) => {
    const list = dataStorage.getStaff();
    const newItem = { id: Date.now(), ...staffMember };
    const updated = [...list, newItem];
    setStorageItem(STORAGE_KEYS.STAFF, updated);
    return newItem;
  },

  deleteStaff: (id) => {
    const list = dataStorage.getStaff();
    const updated = list.filter((s) => s.id !== id);
    setStorageItem(STORAGE_KEYS.STAFF, updated);
    return true;
  },

  // ─── Gallery Methods ───
  getGallery: () => getStorageItem(STORAGE_KEYS.GALLERY, initialData.gallery),

  addGalleryItem: (item) => {
    const list = dataStorage.getGallery();
    const newItem = { id: Date.now(), ...item };
    const updated = [newItem, ...list];
    setStorageItem(STORAGE_KEYS.GALLERY, updated);
    return newItem;
  },

  deleteGalleryItem: (id) => {
    const list = dataStorage.getGallery();
    const updated = list.filter((g) => g.id !== id);
    setStorageItem(STORAGE_KEYS.GALLERY, updated);
    return true;
  },

  // ─── Poll Methods ───
  getPolls: () => {
    const polls = getStorageItem(STORAGE_KEYS.POLLS, initialData.polls || []);
    const now = new Date();
    const activeOnly = polls.filter((p) => !p.expiresAt || new Date(p.expiresAt) > now);

    if (activeOnly.length !== polls.length) {
      const expired = polls.filter((p) => p.expiresAt && new Date(p.expiresAt) <= now);
      expired.forEach((p) => dataStorage.archivePoll(p));
      setStorageItem(STORAGE_KEYS.POLLS, activeOnly);
    }

    // Normalize options array so every option is guaranteed to be an object { id, text, votes }
    return activeOnly.map((poll) => ({
      ...poll,
      options: (poll.options || []).map((opt, idx) => {
        if (typeof opt === 'string') {
          return { id: idx + 1, text: opt, votes: 0 };
        }
        return {
          id: opt.id || idx + 1,
          text: opt.text || (typeof opt === 'object' ? opt.text || String(opt) : String(opt)),
          votes: opt.votes || 0,
        };
      }),
    }));
  },

  archivePoll: (pollToFinish) => {
    if (!pollToFinish) return;

    const normalizedOptions = (pollToFinish.options || []).map((opt, idx) => ({
      id: typeof opt === 'object' && opt.id ? opt.id : idx + 1,
      text: typeof opt === 'string' ? opt : (opt.text || String(opt)),
      votes: typeof opt === 'object' ? (opt.votes || 0) : 0,
    }));

    const totalVotes = normalizedOptions.reduce((sum, opt) => sum + (opt.votes || 0), 0);

    let winnerText = 'No votes cast';
    let maxVotes = -1;

    const processedOptions = normalizedOptions.map((opt) => {
      const votes = opt.votes || 0;
      const percentage = totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0;
      if (votes > maxVotes && votes > 0) {
        maxVotes = votes;
        winnerText = opt.text;
      }
      return {
        ...opt,
        percentage,
      };
    });

    const pollResult = {
      id: Date.now(),
      question: pollToFinish.question,
      category: pollToFinish.category || 'Student Poll',
      allowMultiple: Boolean(pollToFinish.allowMultiple),
      winner: winnerText,
      totalVotes,
      options: processedOptions,
      votersList: pollToFinish.votersList || [],
      endedAt: new Date().toISOString(),
      createdBy: pollToFinish.createdBy || 'Mess Secretary',
    };

    const currentResults = getStorageItem(STORAGE_KEYS.POLL_RESULTS, initialData.pollResults || []);
    setStorageItem(STORAGE_KEYS.POLL_RESULTS, [pollResult, ...currentResults]);
  },

  createPoll: (poll) => {
    const list = dataStorage.getPolls();
    const formattedOptions = (poll.options || []).map((opt, idx) => ({
      id: idx + 1,
      text: typeof opt === 'string' ? opt : (opt.text || String(opt)),
      votes: 0,
    }));

    const newPoll = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      votedUsers: [],
      votersList: [],
      ...poll,
      allowMultiple: Boolean(poll.allowMultiple),
      options: formattedOptions,
    };
    const updated = [newPoll, ...list];
    setStorageItem(STORAGE_KEYS.POLLS, updated);
    return newPoll;
  },

  votePoll: (pollId, optionIds, userId, userName = 'Student') => {
    const list = dataStorage.getPolls();
    let votedSuccessfully = false;

    const selectedOptionIds = Array.isArray(optionIds) ? optionIds : [optionIds];

    const updated = list.map((poll) => {
      if (poll.id === pollId) {
        votedSuccessfully = true;

        const existingVoters = poll.votersList || [];
        const otherVoters = existingVoters.filter((v) => v.userId !== userId);

        const newVoterRecord = {
          userId,
          userName: userName || 'Student',
          optionIds: selectedOptionIds,
          timestamp: new Date().toISOString(),
        };

        const updatedVotersList = [...otherVoters, newVoterRecord];

        const updatedOptions = poll.options.map((opt) => {
          const count = updatedVotersList.filter((v) => (v.optionIds || []).includes(opt.id)).length;
          return { ...opt, votes: count };
        });

        const updatedVotedUsers = Array.from(new Set(updatedVotersList.map((v) => v.userId)));

        return {
          ...poll,
          votedUsers: updatedVotedUsers,
          votersList: updatedVotersList,
          options: updatedOptions,
        };
      }
      return poll;
    });

    if (votedSuccessfully) {
      setStorageItem(STORAGE_KEYS.POLLS, updated);
    }
    return votedSuccessfully;
  },

  // Direct deletion from Admin panel: removes active poll immediately from everyone
  deletePoll: (pollId) => {
    const list = getStorageItem(STORAGE_KEYS.POLLS, initialData.polls || []);
    const remainingPolls = list.filter((p) => String(p.id) !== String(pollId));
    setStorageItem(STORAGE_KEYS.POLLS, remainingPolls);
    return true;
  },

  finishAndDeletePoll: (pollId) => {
    const list = getStorageItem(STORAGE_KEYS.POLLS, initialData.polls || []);
    const pollToFinish = list.find((p) => String(p.id) === String(pollId));

    if (pollToFinish) {
      dataStorage.archivePoll(pollToFinish);
    }

    const remainingPolls = list.filter((p) => String(p.id) !== String(pollId));
    setStorageItem(STORAGE_KEYS.POLLS, remainingPolls);
    return true;
  },

  getPollResults: () => getStorageItem(STORAGE_KEYS.POLL_RESULTS, initialData.pollResults || []),

  // Direct deletion of archived result from Admin panel: removes result immediately from everyone
  deletePollResult: (resultId) => {
    const list = getStorageItem(STORAGE_KEYS.POLL_RESULTS, initialData.pollResults || []);
    const updated = list.filter((r) => String(r.id) !== String(resultId));
    setStorageItem(STORAGE_KEYS.POLL_RESULTS, updated);
    return true;
  },

  checkAndArchiveExpiredPolls: () => {
    try {
      const polls = getStorageItem(STORAGE_KEYS.POLLS, initialData.polls || []);
      const now = new Date();
      let hasChanges = false;

      polls.forEach((poll) => {
        if (poll.expiresAt && new Date(poll.expiresAt) <= now) {
          hasChanges = true;
          dataStorage.finishAndDeletePoll(poll.id);
        }
      });
      return hasChanges;
    } catch (e) {
      console.error('Error auto archiving polls:', e);
      return false;
    }
  },
};

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
