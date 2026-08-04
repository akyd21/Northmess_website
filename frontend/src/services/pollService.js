import api from './api';
import { dataStorage } from '../utils/dataStorage';

export const pollService = {
  getActivePolls: async () => ({ data: dataStorage.getPolls() }),

  createPoll: async (pollData) => {
    const created = dataStorage.createPoll(pollData);
    return { data: created };
  },

  votePoll: async (pollId, optionIds, userId, userName) => {
    const success = dataStorage.votePoll(pollId, optionIds, userId, userName);
    return { data: { success } };
  },

  deletePoll: async (pollId) => {
    dataStorage.deletePoll(pollId);
    return { data: { success: true } };
  },

  finishAndDeletePoll: async (pollId) => {
    dataStorage.finishAndDeletePoll(pollId);
    return { data: { success: true } };
  },

  getPollResults: async () => ({ data: dataStorage.getPollResults() }),

  deletePollResult: async (resultId) => {
    dataStorage.deletePollResult(resultId);
    return { data: { success: true } };
  },
};
