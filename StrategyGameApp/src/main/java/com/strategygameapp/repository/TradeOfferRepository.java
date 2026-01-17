package com.strategygameapp.repository;

import com.strategygameapp.model.TradeOffer;
import com.strategygameapp.model.enums.TradeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TradeOfferRepository extends JpaRepository<TradeOffer, Long> {
    List<TradeOffer> findByMatchId(Long matchId);
    List<TradeOffer> findByMatchIdAndStatus(Long matchId, TradeStatus status);
    Optional<TradeOffer> findByIdAndMatchId(Long id, Long matchId);
}
