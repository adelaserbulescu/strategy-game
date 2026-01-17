package com.strategygameapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "match_players",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_match_players_match_seat", columnNames = {"match_id","seat"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchPlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false, foreignKey = @ForeignKey(name = "fk_match_players_match"))
    private Match match;

    @Column(nullable = false)
    private int seat;

    @Column(nullable = false)
    private boolean bot;

    @Column(nullable = false)
    private boolean alive;

    @Column(nullable = false)
    private int lightning;

    @Column(nullable = false)
    private int wood;

    @Column(nullable = false)
    private int stone;

    @Column(nullable = false)
    private int glass;

    @Column(nullable = false)
    private int force;
}

