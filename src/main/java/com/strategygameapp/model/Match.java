package com.strategygameapp.model;

import com.strategygameapp.model.enums.MatchStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status;

    @Column(nullable = false)
    private int players;

    @Column(nullable = false)
    private int width;

    @Column(nullable = false)
    private int height;

    private Integer currentTurn;

    private Integer winnerSeat;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    private OffsetDateTime startedAt;
    private OffsetDateTime finishedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (status == null) status = MatchStatus.PENDING;
    }
}
