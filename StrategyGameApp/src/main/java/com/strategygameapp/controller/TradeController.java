package com.strategygameapp.controller;

import com.strategygameapp.dto.trade.AcceptTradeRequest;
import com.strategygameapp.dto.trade.CreateTradeRequest;
import com.strategygameapp.dto.trade.TradeResponse;
import com.strategygameapp.model.TradeOffer;
import com.strategygameapp.service.TradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trades/{matchId}")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    @GetMapping
    public ResponseEntity<List<TradeResponse>> list(
            @PathVariable Long matchId,
            @RequestParam(required = false) String status
    ) {
        List<TradeOffer> offers = tradeService.list(matchId, status);
        return ResponseEntity.ok(offers.stream().map(tradeService::toResponse).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(
            @PathVariable Long matchId,
            @RequestBody CreateTradeRequest req
    ) {
        var opt = tradeService.create(matchId, req);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("INVALID_REQUEST");
        return ResponseEntity.status(201).body(tradeService.toResponse(opt.get()));
    }

    @PostMapping("/{offerId}/accept")
    public ResponseEntity<?> accept(
            @PathVariable Long matchId,
            @PathVariable Long offerId,
            @RequestBody AcceptTradeRequest req
    ) {
        var res = tradeService.accept(matchId, offerId, req);
        if (!res.found())
            return ResponseEntity.status(404).body("NOT_FOUND");
        if (!res.accepted())
            return ResponseEntity.status(409).body("{\"error\":\"" + res.error() + "\"}");
        return ResponseEntity.ok("{\"accepted\":true}");
    }

    @PostMapping("/{offerId}/cancel")
    public ResponseEntity<?> cancel(
            @PathVariable Long matchId,
            @PathVariable Long offerId,
            @RequestParam(required = false) Integer bySeat
    ) {
        var opt = tradeService.cancel(matchId, offerId, bySeat);
        if (opt.isEmpty()) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(tradeService.toResponse(opt.get()));
    }
}