package com.northmess.request;

import jakarta.validation.constraints.NotBlank;

public record ComplaintStatusRequest(@NotBlank String status, String adminResponse) {
}