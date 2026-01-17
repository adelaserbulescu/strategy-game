package com.strategygameapp.dto.action;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ActionResultResponse {
    private boolean success;
    private String message;
    private String traceId;
}
