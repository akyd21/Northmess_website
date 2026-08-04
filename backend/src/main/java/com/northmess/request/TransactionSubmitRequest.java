package com.northmess.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TransactionSubmitRequest {
    @NotBlank
    private String transactionId;
}
