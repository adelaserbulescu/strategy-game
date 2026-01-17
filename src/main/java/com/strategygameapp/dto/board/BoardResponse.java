package com.strategygameapp.dto.board;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class BoardResponse {
    private int width;
    private int height;
    private List<CellResponse> cells;
}
