package com.strategygameapp.model;

import com.strategygameapp.model.enums.ActionType;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "action_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Action {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false, foreignKey = @ForeignKey(name = "fk_action_events_match"))
    private Match match;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType type;

    private int playerSeat;

    @Column(length = 500)
    private String message;

    @Column(nullable = false)
    private OffsetDateTime ts;

    @PrePersist
    void prePersist() { if (ts == null) ts = OffsetDateTime.now(); }
}