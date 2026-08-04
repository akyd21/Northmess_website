package com.northmess.request;

import lombok.Data;
import java.util.List;

@Data
public class VoteRequest {
    private List<String> optionIds;
}
