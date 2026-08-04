package com.northmess.controller;

import com.northmess.entity.Poll;
import com.northmess.request.VoteRequest;
import com.northmess.security.UserPrincipal;
import com.northmess.service.PollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/polls")
@RequiredArgsConstructor
public class PollController {

    private final PollService pollService;

    @GetMapping
    public ResponseEntity<List<Poll>> getActivePolls() {
        return ResponseEntity.ok(pollService.getActivePolls());
    }

    @GetMapping("/results")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Poll>> getPollResults() {
        return ResponseEntity.ok(pollService.getPollResults());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Poll> createPoll(@RequestBody Poll poll) {
        return ResponseEntity.ok(pollService.createPoll(poll));
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> votePoll(
            @PathVariable String id,
            @RequestBody VoteRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        pollService.vote(id, request.getOptionIds(), user.getId(), user.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/finish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> finishPoll(@PathVariable String id) {
        pollService.finishPoll(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePoll(@PathVariable String id) {
        pollService.deletePoll(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
