package com.strategygameapp.scheduler;

import com.strategygameapp.repository.MatchRepository;
import com.strategygameapp.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ResourceScheduler {

    private final ResourceService resourceService;
    private final MatchRepository matchRepo;

    @Scheduled(fixedRate = 2000)
    public void autoResourceGain() {
        matchRepo.findAll().forEach(m -> resourceService.resourceGain(m.getId()));
    }

    @Scheduled(fixedRate = 20000)
    public void autoLightningRecharge() {
        matchRepo.findAll().forEach(m -> resourceService.lightningRecharge(m.getId()));
    }
}
