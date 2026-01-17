package com.strategygameapp.model;

import com.strategygameapp.model.enums.ResourceType;
import com.strategygameapp.model.enums.TradeStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trade_offers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false, foreignKey = @ForeignKey(name = "fk_trade_offers_match"))
    private Match match;

    @Column(name = "from_seat", nullable = false)
    private int from;

    @Column(name = "to_seat", nullable = false)
    private int to;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ResourceType give;

    @Enumerated(EnumType.STRING)
    @Column(name = "get_resource",nullable = false, length = 20)
    private ResourceType get;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TradeStatus status;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime expiresAt;

    private Integer acceptedBySeat;
    private OffsetDateTime closedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (status == null) status = TradeStatus.OPEN;
    }
}
