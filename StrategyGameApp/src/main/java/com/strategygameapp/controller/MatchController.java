package com.strategygameapp.controller;

import com.strategygameapp.dto.match.CreateMatchRequest;
import com.strategygameapp.dto.match.MatchResponse;
import com.strategygameapp.model.Match;
import com.strategygameapp.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateMatchRequest req) {
        var err = matchService.validateCreate(req);
        if (err.isPresent()) {
            return ResponseEntity.badRequest().body(err.get());
        }
        Match m = matchService.create(req);
        return ResponseEntity.status(201).body(toResponse(m));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<MatchResponse> start(@PathVariable Long id) {
        var opt = matchService.start(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).build();
        Match m = opt.get();
        return ResponseEntity.accepted().body(toResponse(m));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<MatchResponse> stop(@PathVariable Long id) {
        var opt = matchService.stop(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).build();
        Match m = opt.get();
        return ResponseEntity.ok(toResponse(m));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse> get(@PathVariable Long id) {
        var opt = matchService.get(id);
        return opt.map(match -> ResponseEntity.ok(toResponse(match))).orElseGet(() -> ResponseEntity.status(404).build());
    }

    @GetMapping
    public ResponseEntity<List<MatchResponse>> list(@RequestParam(required = false) String status) {
        List<Match> matches = matchService.list(status);
        List<MatchResponse> out = matches.stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    private MatchResponse toResponse(Match m) {
        return new MatchResponse(
                m.getId(),
                m.getStatus().name(),
                m.getPlayers(),
                m.getWidth(),
                m.getHeight(),
                m.getCurrentTurn(),
                m.getWinnerSeat(),
                m.getCreatedAt(),
                m.getStartedAt(),
                m.getFinishedAt()
        );
    }
}