package com.strategygameapp.dto.match;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
public class MatchResponse {
    private Long id;
    private String status;
    private int players;
    private int width;
    private int height;
    private Integer currentTurn;
    private Integer winner;
    private OffsetDateTime createdAt;
    private OffsetDateTime startedAt;
    private OffsetDateTime finishedAt;
}
