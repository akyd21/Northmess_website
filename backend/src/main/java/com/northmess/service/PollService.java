package com.northmess.service;

import com.northmess.entity.Poll;
import com.northmess.entity.Poll.PollOption;
import com.northmess.entity.Poll.Voter;
import com.northmess.exception.ResourceNotFoundException;
import com.northmess.repository.PollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollService {
    
    private final PollRepository pollRepository;

    public List<Poll> getActivePolls() {
        return pollRepository.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }
    
    public List<Poll> getPollResults() {
        return pollRepository.findByStatusOrderByCreatedAtDesc("ARCHIVED");
    }

    public Poll createPoll(Poll poll) {
        poll.setCreatedAt(new Date());
        poll.setStatus("ACTIVE");
        
        // Ensure options have IDs
        if (poll.getOptions() != null) {
            for (PollOption option : poll.getOptions()) {
                if (option.getId() == null || option.getId().isBlank()) {
                    option.setId(UUID.randomUUID().toString());
                }
                option.setVotes(0);
            }
        }
        
        return pollRepository.save(poll);
    }

    public void vote(String pollId, List<String> optionIds, String userId, String userName) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));
        
        if (!"ACTIVE".equals(poll.getStatus())) {
            throw new IllegalStateException("Cannot vote on an archived poll");
        }
        
        // Check if already voted
        if (poll.getVotersList() != null && poll.getVotersList().stream().anyMatch(v -> v.getUserId().equals(userId))) {
            throw new IllegalStateException("User has already voted");
        }
        
        // Update votes
        if (poll.getOptions() != null) {
            for (PollOption option : poll.getOptions()) {
                if (optionIds.contains(option.getId())) {
                    option.setVotes(option.getVotes() + 1);
                }
            }
        }
        
        // Add voter
        Voter voter = Voter.builder()
                .userId(userId)
                .name(userName)
                .votedAt(new Date())
                .build();
        
        if (poll.getVotersList() == null) {
            poll.setVotersList(List.of(voter));
        } else {
            poll.getVotersList().add(voter);
        }
        
        pollRepository.save(poll);
    }
    
    public void finishPoll(String pollId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));
        poll.setStatus("ARCHIVED");
        pollRepository.save(poll);
    }

    public void deletePoll(String pollId) {
        if (!pollRepository.existsById(pollId)) {
            throw new ResourceNotFoundException("Poll not found");
        }
        pollRepository.deleteById(pollId);
    }
}
