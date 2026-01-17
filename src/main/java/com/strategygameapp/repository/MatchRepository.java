package com.strategygameapp.repository;

import com.strategygameapp.model.Match;
import com.strategygameapp.model.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByStatus(MatchStatus st);
}
