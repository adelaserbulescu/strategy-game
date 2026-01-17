package com.strategygameapp.dto.board;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CellResponse {
    private int x;
    private int y;
    private String region;
    private int ownerSeat;
    private int hits;
}
