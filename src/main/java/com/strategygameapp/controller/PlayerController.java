package com.strategygameapp.controller;

import com.strategygameapp.dto.player.PlayerResponse;
import com.strategygameapp.model.MatchPlayer;
import com.strategygameapp.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players/{matchId}")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @GetMapping
    public ResponseEntity<List<PlayerResponse>> list(@PathVariable Long matchId) {
        List<MatchPlayer> players = playerService.list(matchId);
        List<PlayerResponse> out = players.stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    @GetMapping("/{seat}")
    public ResponseEntity<PlayerResponse> get(@PathVariable Long matchId, @PathVariable int seat) {
        var opt = playerService.get(matchId, seat);
        return opt.map(matchPlayer -> ResponseEntity.ok(toResponse(matchPlayer))).orElseGet(() -> ResponseEntity.status(404).build());
    }

    private PlayerResponse toResponse(MatchPlayer p) {
        return new PlayerResponse(
                p.getId(), p.getSeat(), p.isBot(), p.isAlive(),
                p.getLightning(), p.getWood(), p.getStone(), p.getGlass(), p.getForce()
        );
    }
}
