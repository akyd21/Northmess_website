import api from './api';
import { dataStorage } from '../utils/dataStorage';

export const pollService = {
  getActivePolls: async () => {
    try {
      const res = await api.get('/polls/active');
      return res;
    } catch {
      return { data: dataStorage.getPolls() };
    }
  },

  createPoll: async (pollData) => {
    try {
      const res = await api.post('/polls', pollData);
      dataStorage.createPoll(res.data || pollData);
      return res;
    } catch {
      const created = dataStorage.createPoll(pollData);
      return { data: created };
    }
  },

  votePoll: async (pollId, optionIds, userId, userName) => {
    try {
      const res = await api.post(`/polls/${pollId}/vote`, { optionIds, userId, userName });
      dataStorage.votePoll(pollId, optionIds, userId, userName);
      return res;
    } catch {
      const success = dataStorage.votePoll(pollId, optionIds, userId, userName);
      return { data: { success } };
    }
  },

  deletePoll: async (pollId) => {
    try {
      const res = await api.delete(`/polls/${pollId}`);
      dataStorage.deletePoll(pollId);
      return res;
    } catch {
      dataStorage.deletePoll(pollId);
      return { data: { success: true } };
    }
  },

  finishAndDeletePoll: async (pollId) => {
    try {
      const res = await api.delete(`/polls/${pollId}/finish`);
      dataStorage.finishAndDeletePoll(pollId);
      return res;
    } catch {
      dataStorage.finishAndDeletePoll(pollId);
      return { data: { success: true } };
    }
  },

  getPollResults: async () => {
    try {
      const res = await api.get('/polls/results');
      return res;
    } catch {
      return { data: dataStorage.getPollResults() };
    }
  },

  deletePollResult: async (resultId) => {
    try {
      const res = await api.delete(`/polls/results/${resultId}`);
      dataStorage.deletePollResult(resultId);
      return res;
    } catch {
      dataStorage.deletePollResult(resultId);
      return { data: { success: true } };
    }
  },
};
