package com.strategygameapp.service;

import com.strategygameapp.dto.action.*;
import com.strategygameapp.model.Action;
import com.strategygameapp.model.BoardCell;
import com.strategygameapp.model.Match;
import com.strategygameapp.model.MatchPlayer;
import com.strategygameapp.model.enums.ActionType;
import com.strategygameapp.model.enums.MatchStatus;
import com.strategygameapp.model.enums.RegionType;
import com.strategygameapp.repository.ActionRepository;
import com.strategygameapp.repository.BoardCellRepository;
import com.strategygameapp.repository.MatchPlayerRepository;
import com.strategygameapp.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActionService {

    private final MatchRepository matchRepo;
    private final MatchPlayerRepository playerRepo;
    private final BoardCellRepository cellRepo;
    private final ActionRepository actionRepo;

    @Transactional
    public ActionResultResponse place(Long matchId, ActionRequest req) {
        String traceId = UUID.randomUUID().toString();
        ActionOutcome outcome = placeInternal(matchId, req.getPlayerId(), req.getX(), req.getY());

        if (outcome.success) {
            saveAction(matchId, req.getPlayerId(), ActionType.PLACE_STARTING_HOUSE, outcome.message);
        }

        return new ActionResultResponse(outcome.success, outcome.message, traceId);
    }

    @Transactional
    public ActionResultResponse build(Long matchId, ActionRequest req) {
        String traceId = UUID.randomUUID().toString();
        ActionOutcome outcome = buildInternal(matchId, req.getPlayerId(), req.getX(), req.getY());

        if (outcome.success) {
            saveAction(matchId, req.getPlayerId(), ActionType.BUILD, outcome.message);
        }

        return new ActionResultResponse(outcome.success, outcome.message, traceId);
    }

    @Transactional
    public ActionResultResponse endTurn(Long matchId, EndTurnRequest req) {
        String traceId = UUID.randomUUID().toString();
        ActionOutcome outcome = endTurnInternal(matchId, req.getPlayerId());

        if (outcome.success) {
            saveAction(matchId, req.getPlayerId(), ActionType.END_TURN, outcome.message);
        }

        return new ActionResultResponse(outcome.success, outcome.message, traceId);
    }

    @Transactional
    public ActionResultResponse attack(Long matchId, ActionRequest req) {
        String traceId = UUID.randomUUID().toString();
        ActionOutcome outcome = attackInternal(matchId, req.getPlayerId(), req.getX(), req.getY());

        if (outcome.success) {
            saveAction(matchId, req.getPlayerId(), ActionType.ATTACK, outcome.message);
        }

        return new ActionResultResponse(outcome.success, outcome.message, traceId);
    }

    private ActionOutcome placeInternal(Long matchId, int seat, int x, int y) {
        Match match = matchRepo.findById(matchId).orElse(null);
        if (match == null) return fail("MATCH_NOT_FOUND");

        if (match.getStatus() != MatchStatus.PENDING) {
            return fail("CANNOT_PLACE_HOUSE_IN_NON_PENDING_MATCH");
        }

        MatchPlayer player = playerRepo.findByMatchIdAndSeat(matchId, seat).orElse(null);
        if (player == null) return fail("PLAYER_NOT_FOUND");
        if (!player.isAlive()) return fail("PLAYER_DEAD");

        BoardCell cell = cellRepo.findByMatchIdAndXAndY(matchId, x, y).orElse(null);
        if (cell == null) return fail("CELL_NOT_FOUND");
        if (cell.getOwner() >= 0) {
            return fail("CELL_OCCUPIED");
        }

        cell.setOwner(seat);
        cell.setHits(0);
        cellRepo.save(cell);

        return ok("HOUSE_PLACED");
    }

    private ActionOutcome buildInternal(Long matchId, int seat, int x, int y) {
        Match match = matchRepo.findById(matchId).orElse(null);
        if (match == null) return fail("MATCH_NOT_FOUND");

        if (match.getStatus() != MatchStatus.RUNNING) {
            return fail("MATCH_NOT_RUNNING");
        }
        if (match.getCurrentTurn() == null || match.getCurrentTurn() != seat) {
            return fail("NOT_YOUR_TURN");
        }

        MatchPlayer player = playerRepo.findByMatchIdAndSeat(matchId, seat).orElse(null);
        if (player == null) return fail("PLAYER_NOT_FOUND");
        if (!player.isAlive()) return fail("PLAYER_DEAD");

        BoardCell cell = cellRepo.findByMatchIdAndXAndY(matchId, x, y).orElse(null);
        if (cell == null) return fail("CELL_NOT_FOUND");
        if (cell.getOwner() >= 0) {
            return fail("CELL_OCCUPIED");
        }

        RegionType r = cell.getRegion();
        int[] cost = buildCostFor(r);
        if (!hasResources(player, cost)) {
            return fail("INSUFFICIENT_RESOURCES");
        }

        pay(player, cost);
        playerRepo.save(player);

        cell.setOwner(seat);
        cell.setHits(0);
        cellRepo.save(cell);

        advanceTurn(match);
        matchRepo.save(match);

        return ok("BUILD_SUCCESS");
    }

    private ActionOutcome endTurnInternal(Long matchId, int seat) {
        Match match = matchRepo.findById(matchId).orElse(null);
        if (match == null) return fail("MATCH_NOT_FOUND");

        if (match.getStatus() != MatchStatus.RUNNING) {
            return fail("MATCH_NOT_RUNNING");
        }
        if (match.getCurrentTurn() == null || match.getCurrentTurn() != seat) {
            return fail("NOT_YOUR_TURN");
        }

        advanceTurn(match);
        matchRepo.save(match);
        return ok("TURN_ENDED");
    }

    private ActionOutcome attackInternal(Long matchId, int attackerSeat, int x, int y) {
        Match match = matchRepo.findById(matchId).orElse(null);
        if (match == null) return fail("MATCH_NOT_FOUND");

        if (match.getStatus() != MatchStatus.RUNNING) {
            return fail("MATCH_NOT_RUNNING");
        }
        if (match.getCurrentTurn() == null || match.getCurrentTurn() != attackerSeat) {
            return fail("NOT_YOUR_TURN");
        }

        MatchPlayer attacker = playerRepo.findByMatchIdAndSeat(matchId, attackerSeat).orElse(null);
        if (attacker == null) return fail("PLAYER_NOT_FOUND");
        if (!attacker.isAlive()) return fail("PLAYER_DEAD");
        if (attacker.getLightning() <= 0) return fail("NO_LIGHTNING");

        BoardCell cell = cellRepo.findByMatchIdAndXAndY(matchId, x, y).orElse(null);
        if (cell == null) return fail("CELL_NOT_FOUND");

        int ownerSeat = cell.getOwner();
        if (ownerSeat < 0) return fail("NO_HOUSE_HERE");
        if (ownerSeat == attackerSeat) return fail("CANNOT_ATTACK_OWN_HOUSE");

        attacker.setLightning(attacker.getLightning() - 1);
        playerRepo.save(attacker);

        int hits = cell.getHits() + 1;
        cell.setHits(hits);

        if (hits >= 3) {
            cell.setOwner(-1);
            cell.setHits(0);
            cellRepo.save(cell);

            MatchPlayer victim = playerRepo.findByMatchIdAndSeat(matchId, ownerSeat).orElse(null);
            if (victim != null) {
                boolean anyLeft = cellRepo.findByMatchIdOrderByYAscXAsc(matchId).stream()
                        .anyMatch(c -> c.getOwner() == ownerSeat);
                if (!anyLeft) {
                    victim.setAlive(false);
                    playerRepo.save(victim);

                    List<MatchPlayer> seats = playerRepo.findByMatchIdOrderBySeatAsc(matchId);
                    long aliveCount = seats.stream().filter(MatchPlayer::isAlive).count();
                    if (aliveCount == 1) {
                        int winnerSeat = seats.stream()
                                .filter(MatchPlayer::isAlive)
                                .findFirst()
                                .get()
                                .getSeat();
                        match.setWinnerSeat(winnerSeat);
                        match.setStatus(MatchStatus.FINISHED);
                    }
                }
            }
        } else {
            cellRepo.save(cell);
        }

        if (match.getStatus() == MatchStatus.RUNNING) {
            advanceTurn(match);
            matchRepo.save(match);
        }

        return ok("ATTACK_SUCCESS");
    }

    private void saveAction(Long matchId, int seat, ActionType type, String message) {
        Match match = matchRepo.getReferenceById(matchId);
        Action a = Action.builder()
                .match(match)
                .playerSeat(seat)
                .type(type)
                .message(message)
                .build();
        actionRepo.save(a);
    }

    private int[] buildCostFor(RegionType r) {
        return switch (r) {
            case SKY       -> new int[]{1, 1, 0, 2};
            case FOREST    -> new int[]{2, 2, 0, 0};
            case WATERS    -> new int[]{1, 1, 2, 1};
            case VILLAGES  -> new int[]{2, 2, 1, 0};
            case MOUNTAINS -> new int[]{0, 3, 0, 2};
        };
    }

    private boolean hasResources(MatchPlayer p, int[] c) {
        return p.getWood()  >= c[0]
                && p.getStone() >= c[1]
                && p.getGlass() >= c[2]
                && p.getForce() >= c[3];
    }

    private void pay(MatchPlayer p, int[] c) {
        p.setWood(p.getWood()   - c[0]);
        p.setStone(p.getStone() - c[1]);
        p.setGlass(p.getGlass() - c[2]);
        p.setForce(p.getForce() - c[3]);
    }

    private void advanceTurn(Match match) {
        List<MatchPlayer> seats = playerRepo.findByMatchIdOrderBySeatAsc(match.getId());
        if (seats.isEmpty()) return;
        int idx = match.getCurrentTurn();

        for (int i = 0; i < seats.size(); i++) {
            idx = (idx + 1) % seats.size();
            if (seats.get(idx).isAlive()) {
                if(idx == 0)
                    idx = seats.size();
                match.setCurrentTurn(idx);
                return;
            }
        }
    }

    private record ActionOutcome(boolean success, String message) {}

    private ActionOutcome ok(String msg)    { return new ActionOutcome(true, msg); }
    private ActionOutcome fail(String msg)  { return new ActionOutcome(false, msg); }
}
