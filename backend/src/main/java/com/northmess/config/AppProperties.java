package com.northmess.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private Jwt jwt = new Jwt();
    private Mail mail = new Mail();
    private String uploadDir = "uploads";

    @Data
    public static class Jwt {
        private String secret;
        private long expirationMs = 86400000L;
    }

    @Data
    public static class Mail {
        private boolean enabled = false;
        private String fromAddress = "noreply@northmess.local";
        private String recipientEmail = "admin@northmess.local";
    }
}