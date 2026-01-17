package com.strategygameapp.service;

import com.strategygameapp.dto.board.BoardResponse;
import com.strategygameapp.dto.board.CellResponse;
import com.strategygameapp.model.BoardCell;
import com.strategygameapp.model.Match;
import com.strategygameapp.repository.BoardCellRepository;
import com.strategygameapp.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardCellRepository cellRepo;
    private final MatchRepository matchRepo;

    public Optional<BoardResponse> getBoard(Long matchId) {
        Optional<Match> mOpt = matchRepo.findById(matchId);
        if (mOpt.isEmpty()) return Optional.empty();

        Match m = mOpt.get();
        List<BoardCell> cells = cellRepo.findByMatchIdOrderByYAscXAsc(matchId);
        List<CellResponse> cellDtos = cells.stream()
                .map(this::toCell)
                .toList();

        return Optional.of(new BoardResponse(m.getWidth(), m.getHeight(), cellDtos));
    }

    public Optional<CellResponse> getCell(Long matchId, int x, int y) {
        return cellRepo.findByMatchIdAndXAndY(matchId, x, y).map(this::toCell);
    }

    private CellResponse toCell(BoardCell c) {
        return new CellResponse(
                c.getX(),
                c.getY(),
                c.getRegion().name(),
                c.getOwner(),
                c.getHits()
        );
    }
}
