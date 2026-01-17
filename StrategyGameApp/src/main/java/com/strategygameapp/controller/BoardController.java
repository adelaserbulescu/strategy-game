package com.strategygameapp.controller;

import com.strategygameapp.dto.board.BoardResponse;
import com.strategygameapp.dto.board.CellResponse;
import com.strategygameapp.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board/{matchId}")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<BoardResponse> getBoard(@PathVariable Long matchId) {
        return boardService.getBoard(matchId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).build());
    }

    @GetMapping("/cells/{x}/{y}")
    public ResponseEntity<CellResponse> getCell(
            @PathVariable Long matchId,
            @PathVariable int x,
            @PathVariable int y
    ) {
        return boardService.getCell(matchId, x, y)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).build());
    }
}
