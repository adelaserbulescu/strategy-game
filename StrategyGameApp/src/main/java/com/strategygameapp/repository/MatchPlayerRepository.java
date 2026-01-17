package com.strategygameapp.repository;

import com.strategygameapp.model.MatchPlayer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchPlayerRepository extends JpaRepository<MatchPlayer, Long> {
    List<MatchPlayer> findByMatchIdOrderBySeatAsc(Long matchId);
    Optional<MatchPlayer> findByMatchIdAndSeat(Long matchId, int seat);
}
