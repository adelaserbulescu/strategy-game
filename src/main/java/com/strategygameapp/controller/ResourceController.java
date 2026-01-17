package com.strategygameapp.controller;

import com.strategygameapp.dto.action.ActionResultResponse;
import com.strategygameapp.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources/{matchId}")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping("/resource-gain")
    public ResponseEntity<ActionResultResponse> resourceGain(@PathVariable Long matchId) {
        ActionResultResponse res = resourceService.resourceGain(matchId);
        if (!res.isSuccess() && "MATCH_NOT_FOUND".equals(res.getMessage())) {
            return ResponseEntity.status(404).body(res);
        }
        return ResponseEntity.accepted().body(res);
    }

    @PostMapping("/lightning-recharge")
    public ResponseEntity<ActionResultResponse> lightningRecharge(@PathVariable Long matchId) {
        ActionResultResponse res = resourceService.lightningRecharge(matchId);
        if (!res.isSuccess() && "MATCH_NOT_FOUND".equals(res.getMessage())) {
            return ResponseEntity.status(404).body(res);
        }
        return ResponseEntity.accepted().body(res);
    }
}
