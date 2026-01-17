package com.strategygameapp.service;


import com.strategygameapp.dto.match.CreateMatchRequest;
import com.strategygameapp.model.BoardCell;
import com.strategygameapp.model.Match;
import com.strategygameapp.model.MatchPlayer;
import com.strategygameapp.model.enums.MatchStatus;
import com.strategygameapp.model.enums.RegionType;
import com.strategygameapp.repository.BoardCellRepository;
import com.strategygameapp.repository.MatchPlayerRepository;
import com.strategygameapp.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepo;
    private final MatchPlayerRepository playerRepo;
    private final BoardCellRepository cellRepo;

    public Optional<Match> get(Long id) {
        return matchRepo.findById(id);
    }

    public List<Match> list(String status) {
        if (status == null || status.isBlank()) return matchRepo.findAll();
        MatchStatus st = MatchStatus.valueOf(status.toUpperCase());
        return matchRepo.findByStatus(st);
    }

    public Optional<Match> start(Long id) {
        Optional<Match> opt = matchRepo.findById(id);
        if (opt.isEmpty()) return Optional.empty();

        Match m = opt.get();
        if (m.getStatus() == MatchStatus.PENDING) {
            m.setStatus(MatchStatus.RUNNING);
            m.setCurrentTurn(1);
            m.setStartedAt(OffsetDateTime.now());
            matchRepo.save(m);
        }
        return Optional.of(m);
    }

    public Optional<Match> stop(Long id) {
        Optional<Match> opt = matchRepo.findById(id);
        if (opt.isEmpty()) return Optional.empty();

        Match m = opt.get();
        if (m.getStatus() == MatchStatus.RUNNING || m.getStatus() == MatchStatus.PENDING) {
            m.setStatus(MatchStatus.FINISHED);
            m.setFinishedAt(OffsetDateTime.now());
            matchRepo.save(m);
        }
        return Optional.of(m);
    }

    public Optional<String> validateCreate(CreateMatchRequest req) {
        if (req == null) return Optional.of("Request body is required");
        if (req.getPlayers() < 2) return Optional.of("players must be >= 2");
        if (req.getWidth() < 1 || req.getHeight() < 1) return Optional.of("width/height must be >= 1");
        if (req.getBots() == null || req.getBots().size() != req.getPlayers())
            return Optional.of("bots list size must equal players");
        return Optional.empty();
    }

    public Match create(CreateMatchRequest req) {
        Match m = Match.builder()
                .status(MatchStatus.PENDING)
                .players(req.getPlayers())
                .width(req.getWidth())
                .height(req.getHeight())
                .createdAt(OffsetDateTime.now())
                .build();
        matchRepo.save(m);

        for (int seat = 1; seat <= req.getPlayers(); seat++) {
            boolean bot = req.getBots().get(seat - 1);
            MatchPlayer p = MatchPlayer.builder()
                    .match(m)
                    .seat(seat)
                    .bot(bot)
                    .alive(true)
                    .lightning(2)
                    .wood(2)
                    .stone(2)
                    .glass(2)
                    .force(2)
                    .build();
            playerRepo.save(p);
        }

        RegionType[][] regions = generateRegions(req.getWidth(), req.getHeight());
        for (int y = 0; y < req.getHeight(); y++) {
            for (int x = 0; x < req.getWidth(); x++) {
                BoardCell c = BoardCell.builder()
                        .match(m)
                        .x(x).y(y)
                        .region(regions[y][x])
                        .owner(-1)
                        .hits(0)
                        .build();
                cellRepo.save(c);
            }
        }

        return m;
    }

    private static RegionType[][] generateRegions(int w, int h) {
        RegionType[] vals = RegionType.values();
        int total = w * h;
        List<RegionType> all = new ArrayList<>(total);

        for (int i = 0; i < total; i++) {
            all.add(vals[i % vals.length]);
        }

        Collections.shuffle(all, new Random(42L));
        RegionType[][] map = new RegionType[h][w];
        int idx = 0;
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                map[y][x] = all.get(idx++);
            }
        }

        return map;
    }
}
