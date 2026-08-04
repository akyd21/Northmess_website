package com.northmess.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyTransactionRequest {
    @NotNull
    private Boolean approved; // true to approve (PAID), false to reject (FAILED/PENDING)
}
