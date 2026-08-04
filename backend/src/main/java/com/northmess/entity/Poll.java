package com.northmess.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "polls")
public class Poll {
    @Id
    private String id;
    private String question;
    private String category;
    private boolean allowMultiple;
    private Date expiresAt;
    private Date createdAt;
    private String createdBy;
    private String status; // "ACTIVE" or "ARCHIVED"
    private List<PollOption> options;
    private List<Voter> votersList;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PollOption {
        private String id;
        private String text;
        private int votes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Voter {
        private String userId;
        private String name;
        private Date votedAt;
    }
}
