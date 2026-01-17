package com.strategygameapp.controller;

import com.strategygameapp.dto.action.*;
import com.strategygameapp.service.ActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/actions/{matchId}")
@RequiredArgsConstructor
public class ActionController {

    private final ActionService gameActionService;

    @PostMapping("/place")
    public ResponseEntity<ActionResultResponse> place(
            @PathVariable Long matchId,
            @RequestBody ActionRequest req
    ) {
        ActionResultResponse res = gameActionService.place(matchId, req);
        return res.isSuccess()
                ? ResponseEntity.accepted().body(res)
                : ResponseEntity.badRequest().body(res);
    }

    @PostMapping("/build")
    public ResponseEntity<ActionResultResponse> build(
            @PathVariable Long matchId,
            @RequestBody ActionRequest req
    ) {
        ActionResultResponse res = gameActionService.build(matchId, req);
        return res.isSuccess()
                ? ResponseEntity.accepted().body(res)
                : ResponseEntity.badRequest().body(res);
    }

    @PostMapping("/end-turn")
    public ResponseEntity<ActionResultResponse> endTurn(
            @PathVariable Long matchId,
            @RequestBody EndTurnRequest req
    ) {
        ActionResultResponse res = gameActionService.endTurn(matchId, req);
        return res.isSuccess()
                ? ResponseEntity.accepted().body(res)
                : ResponseEntity.badRequest().body(res);
    }

    @PostMapping("/attack")
    public ResponseEntity<ActionResultResponse> attack(
            @PathVariable Long matchId,
            @RequestBody ActionRequest req
    ) {
        ActionResultResponse res = gameActionService.attack(matchId, req);
        return res.isSuccess()
                ? ResponseEntity.accepted().body(res)
                : ResponseEntity.badRequest().body(res);
    }
}
