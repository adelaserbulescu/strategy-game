package com.strategygameapp.service;

import com.strategygameapp.dto.trade.AcceptTradeRequest;
import com.strategygameapp.dto.trade.CreateTradeRequest;
import com.strategygameapp.dto.trade.TradeResponse;
import com.strategygameapp.model.Match;
import com.strategygameapp.model.MatchPlayer;
import com.strategygameapp.model.TradeOffer;
import com.strategygameapp.model.enums.ResourceType;
import com.strategygameapp.model.enums.TradeStatus;
import com.strategygameapp.repository.MatchPlayerRepository;
import com.strategygameapp.repository.MatchRepository;
import com.strategygameapp.repository.TradeOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TradeService {

    private final TradeOfferRepository tradeRepo;
    private final MatchRepository matchRepo;
    private final MatchPlayerRepository playerRepo;

    public List<TradeOffer> list(Long matchId, String status) {
        if (status == null || status.isBlank()) {
            return tradeRepo.findByMatchId(matchId);
        }
        TradeStatus st = TradeStatus.valueOf(status.toUpperCase(Locale.ROOT));
        return tradeRepo.findByMatchIdAndStatus(matchId, st);
    }

    @Transactional
    public Optional<TradeOffer> create(Long matchId, CreateTradeRequest req) {
        if (req == null ||
                req.getFrom() == null || req.getTo() == null ||
                req.getGive() == null || req.getGet() == null) {
            return Optional.empty();
        }

        Match m = matchRepo.findById(matchId).orElse(null);
        if (m == null) return Optional.empty();

        MatchPlayer from = playerRepo.findByMatchIdAndSeat(matchId, req.getFrom()).orElse(null);
        if (from == null) return Optional.empty();

        ResourceType give = ResourceType.valueOf(req.getGive().toUpperCase(Locale.ROOT));
        ResourceType get  = ResourceType.valueOf(req.getGet().toUpperCase(Locale.ROOT));

        OffsetDateTime now = OffsetDateTime.now();
        long ttl = (req.getTtlMs() != null && req.getTtlMs() > 0) ? req.getTtlMs() : 20000L;

        TradeOffer offer = TradeOffer.builder()
                .match(m)
                .from(req.getFrom())
                .to(req.getTo())
                .give(give)
                .get(get)
                .status(TradeStatus.OPEN)
                .createdAt(now)
                .expiresAt(now.plusNanos(ttl * 1_000_000))
                .build();

        tradeRepo.save(offer);
        return Optional.of(offer);
    }

    @Transactional
    public AcceptResult accept(Long matchId, Long offerId, AcceptTradeRequest req) {
        OffsetDateTime now = OffsetDateTime.now();

        var opt = tradeRepo.findByIdAndMatchId(offerId, matchId);
        if (opt.isEmpty()) return AcceptResult.notFound();

        TradeOffer t = opt.get();
        if (t.getStatus() != TradeStatus.OPEN) return AcceptResult.conflict("OFFER_CLOSED");

        if (req == null || req.getToSeat() == null) return AcceptResult.conflict("MISSING_TO_SEAT");

        if (t.getTo() != -1 && t.getTo() != req.getToSeat()) {
            return AcceptResult.conflict("NOT_TARGET_OF_OFFER");
        }

        if (now.isAfter(t.getExpiresAt())) {
            t.setStatus(TradeStatus.EXPIRED);
            t.setClosedAt(now);
            tradeRepo.save(t);
            return AcceptResult.conflict("OFFER_EXPIRED");
        }

        MatchPlayer from = playerRepo.findByMatchIdAndSeat(matchId, t.getFrom()).orElse(null);
        MatchPlayer to   = playerRepo.findByMatchIdAndSeat(matchId, req.getToSeat()).orElse(null);
        if (from == null || to == null) return AcceptResult.conflict("INVALID_PLAYER");

        if (!has(from, t.getGive(), 1)) return AcceptResult.conflict("OFFER_OWNER_LACKS_" + t.getGive());
        if (!has(to,   t.getGet(),  1)) return AcceptResult.conflict("ACCEPTER_LACKS_" + t.getGet());

        dec(from, t.getGive());
        inc(to,   t.getGive(), 1);

        dec(to,   t.getGet());
        inc(from, t.getGet(), 1);

        playerRepo.save(from);
        playerRepo.save(to);

        t.setStatus(TradeStatus.ACCEPTED);
        t.setAcceptedBySeat(req.getToSeat());
        t.setClosedAt(now);
        tradeRepo.save(t);

        return AcceptResult.accept();
    }

    @Transactional
    public Optional<TradeOffer> cancel(Long matchId, Long offerId, Integer bySeat) {
        var opt = tradeRepo.findByIdAndMatchId(offerId, matchId);
        if (opt.isEmpty()) return Optional.empty();

        TradeOffer t = opt.get();
        if (t.getStatus() != TradeStatus.OPEN) return Optional.of(t);

        // (Optional) only owner can cancel
        if (bySeat != null && t.getFrom() != bySeat) {
            return Optional.empty();
        }

        t.setStatus(TradeStatus.CANCELLED);
        t.setClosedAt(OffsetDateTime.now());
        tradeRepo.save(t);
        return Optional.of(t);
    }

    private boolean has(MatchPlayer p, ResourceType r, int n) {
        return switch (r) {
            case WOOD -> p.getWood() >= n;
            case STONE -> p.getStone() >= n;
            case GLASS -> p.getGlass() >= n;
            case FORCE -> p.getForce() >= n;
        };
    }
    private void inc(MatchPlayer p, ResourceType r, int n) {
        switch (r) {
            case WOOD -> p.setWood(p.getWood() + n);
            case STONE -> p.setStone(p.getStone() + n);
            case GLASS -> p.setGlass(p.getGlass() + n);
            case FORCE -> p.setForce(p.getForce() + n);
        }
    }
    private void dec(MatchPlayer p, ResourceType r) {
        switch (r) {
            case WOOD -> p.setWood(p.getWood() - 1);
            case STONE -> p.setStone(p.getStone() - 1);
            case GLASS -> p.setGlass(p.getGlass() - 1);
            case FORCE -> p.setForce(p.getForce() - 1);
        }
    }

    public TradeResponse toResponse(TradeOffer t) {
        return new TradeResponse(
                t.getId(),
                t.getMatch().getId(),
                t.getFrom(),
                t.getTo(),
                t.getGive().name(),
                t.getGet().name(),
                t.getStatus().name(),
                t.getCreatedAt(),
                t.getExpiresAt(),
                t.getAcceptedBySeat(),
                t.getClosedAt()
        );
    }

    public record AcceptResult(boolean found, boolean accepted, String error) {
        static AcceptResult notFound() {
            return new AcceptResult(false, false, "NOT_FOUND");
        }

        static AcceptResult accept() {
            return new AcceptResult(true,  true,  null);
        }

        static AcceptResult conflict(String err) {
            return new AcceptResult(true,  false, err);
        }
    }
}