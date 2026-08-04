package com.northmess.request;

import jakarta.validation.constraints.NotNull;

public class PaymentRequest {
    @NotNull
    private Double amount;
    private Integer month;
    private Integer year;

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
}
