package com.strategygameapp.repository;

import com.strategygameapp.model.BoardCell;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BoardCellRepository extends JpaRepository<BoardCell, Long> {
    List<BoardCell> findByMatchIdOrderByYAscXAsc(Long matchId);
    Optional<BoardCell> findByMatchIdAndXAndY(Long matchId, int x, int y);
}
