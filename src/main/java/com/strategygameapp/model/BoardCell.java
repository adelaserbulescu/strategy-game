package com.strategygameapp.model;

import com.strategygameapp.model.enums.RegionType;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "board_cells",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_board_cells_match_xy", columnNames = {"match_id","x","y"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardCell {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false, foreignKey = @ForeignKey(name = "fk_board_cells_match"))
    private Match match;

    @Column(nullable = false)
    private int x;

    @Column(nullable = false)
    private int y;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegionType region;

    @Column(nullable = false)
    private int owner;

    @Column(nullable = false)
    private int hits;
}
