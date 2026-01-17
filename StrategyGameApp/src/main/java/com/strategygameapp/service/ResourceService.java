package com.strategygameapp.service;

import com.strategygameapp.dto.action.ActionResultResponse;
import com.strategygameapp.model.BoardCell;
import com.strategygameapp.model.Match;
import com.strategygameapp.model.MatchPlayer;
import com.strategygameapp.model.enums.RegionType;
import com.strategygameapp.model.enums.ResourceType;
import com.strategygameapp.repository.BoardCellRepository;
import com.strategygameapp.repository.MatchPlayerRepository;
import com.strategygameapp.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ResourceService{

    private final MatchRepository matchRepo;
    private final MatchPlayerRepository playerRepo;
    private final BoardCellRepository cellRepo;

    @Transactional
    public ActionResultResponse resourceGain(Long matchId) {
        String traceId = UUID.randomUUID().toString();

        Match match = matchRepo.findById(matchId).orElse(null);
        if (match == null) {
            return new ActionResultResponse(false, "MATCH_NOT_FOUND", traceId);
        }

        ActionOutcome out = resourceGainInternal(matchId);

        return new ActionResultResponse(out.success, out.message, traceId);
    }

    @Transactional
    public ActionResultResponse lightningRecharge(Long matchId) {
        String traceId = UUID.randomUUID().toString();

        Match match = matchRepo.findById(matchId).orElse(null);
        if (match == null) {
            return new ActionResultResponse(false, "MATCH_NOT_FOUND", traceId);
        }

        ActionOutcome out = lightningRechargeInternal(matchId);
        return new ActionResultResponse(out.success, out.message, traceId);
    }

    private ActionOutcome resourceGainInternal(Long matchId) {
        List<BoardCell> cells = cellRepo.findByMatchIdOrderByYAscXAsc(matchId);
        if (cells.isEmpty()) {
            return ok("NO_CELLS");
        }

        List<MatchPlayer> players = playerRepo.findByMatchIdOrderBySeatAsc(matchId);
        if (players.isEmpty()) {
            return fail("NO_PLAYERS");
        }
        Map<Integer, MatchPlayer> bySeat = new HashMap<>();
        for (MatchPlayer p : players) {
            bySeat.put(p.getSeat(), p);
        }

        Map<Integer, EnumMap<RegionType, Integer>> regionCounts = new HashMap<>();
        for (BoardCell c : cells) {
            int ownerSeat = c.getOwner();
            if (ownerSeat < 0) continue;

            RegionType rt = c.getRegion();
            regionCounts
                    .computeIfAbsent(ownerSeat, s -> new EnumMap<>(RegionType.class))
                    .merge(rt, 1, Integer::sum);
        }

        if (regionCounts.isEmpty()) {
            return ok("NO_HOUSES");
        }

        Map<Integer, EnumMap<ResourceType, Integer>> gains = new HashMap<>();

        for (BoardCell c : cells) {
            int ownerSeat = c.getOwner();
            if (ownerSeat < 0) continue;

            RegionType rt = c.getRegion();

            ResourceType baseRes = switch (rt) {
                case SKY       -> ResourceType.FORCE;
                case FOREST    -> ResourceType.WOOD;
                case WATERS    -> ResourceType.GLASS;
                case VILLAGES  -> null;
                case MOUNTAINS -> ResourceType.STONE;
            };

            ResourceType resToGive;
            if (rt == RegionType.VILLAGES) {
                resToGive = Math.random() < 0.5 ? ResourceType.WOOD : ResourceType.STONE;
            } else {
                resToGive = baseRes;
            }

            EnumMap<RegionType, Integer> seatCounts =
                    regionCounts.getOrDefault(ownerSeat, new EnumMap<>(RegionType.class));
            int cnt = seatCounts.getOrDefault(rt, 0);
            int bonus = (cnt >= 2) ? 1 : 0;
            int total = 1 + bonus;

            gains
                    .computeIfAbsent(ownerSeat, s -> new EnumMap<>(ResourceType.class))
                    .merge(resToGive, total, Integer::sum);
        }

        if (gains.isEmpty()) {
            return ok("NO_GAIN");
        }

        for (Map.Entry<Integer, EnumMap<ResourceType, Integer>> e : gains.entrySet()) {
            Integer seat = e.getKey();
            MatchPlayer p = bySeat.get(seat);
            if (p == null || !p.isAlive()) continue;

            EnumMap<ResourceType, Integer> perRes = e.getValue();
            for (Map.Entry<ResourceType, Integer> gr : perRes.entrySet()) {
                ResourceType rt = gr.getKey();
                int amount = gr.getValue();
                switch (rt) {
                    case WOOD  -> p.setWood(p.getWood() + amount);
                    case STONE -> p.setStone(p.getStone() + amount);
                    case GLASS -> p.setGlass(p.getGlass() + amount);
                    case FORCE -> p.setForce(p.getForce() + amount);
                }
            }
        }

        playerRepo.saveAll(players);

        return ok("RESOURCE_GAIN_APPLIED");
    }

    private ActionOutcome lightningRechargeInternal(Long matchId) {
        List<MatchPlayer> players = playerRepo.findByMatchIdOrderBySeatAsc(matchId);
        if (players.isEmpty()) {
            return fail("NO_PLAYERS");
        }

        List<MatchPlayer> alive = players.stream()
                .filter(MatchPlayer::isAlive)
                .toList();

        if (alive.isEmpty()) {
            return ok("NO_ALIVE_PLAYERS");
        }

        boolean allEmpty = true;
        for (MatchPlayer p : alive) {
            if (p.getLightning() > 0) {
                allEmpty = false;
                break;
            }
        }

        if (!allEmpty) {
            return ok("NO_RECHARGE (SOME_HAVE_LIGHTNING)");
        }

        for (MatchPlayer p : alive) {
            p.setLightning(p.getLightning() + 1);
        }

        playerRepo.saveAll(alive);

        return ok("LIGHTNING_RECHARGED");
    }

    private record ActionOutcome(boolean success, String message) {}
    private ActionOutcome ok(String msg)   { return new ActionOutcome(true,  msg); }
    private ActionOutcome fail(String msg) { return new ActionOutcome(false, msg); }
}
