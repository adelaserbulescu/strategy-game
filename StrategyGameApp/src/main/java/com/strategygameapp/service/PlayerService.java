package com.strategygameapp.service;


import com.strategygameapp.model.MatchPlayer;
import com.strategygameapp.repository.MatchPlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final MatchPlayerRepository playerRepo;

    public List<MatchPlayer> list(Long matchId) {
        return playerRepo.findByMatchIdOrderBySeatAsc(matchId);
    }

    public Optional<MatchPlayer> get(Long matchId, int seat) {
        return playerRepo.findByMatchIdAndSeat(matchId, seat);
    }
}
