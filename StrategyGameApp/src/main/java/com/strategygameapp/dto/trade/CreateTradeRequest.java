package com.strategygameapp.dto.trade;

import lombok.Data;

@Data
public class CreateTradeRequest {
    private Integer from;
    private Integer to;
    private String give;
    private String get;
    private Long ttlMs;
}
