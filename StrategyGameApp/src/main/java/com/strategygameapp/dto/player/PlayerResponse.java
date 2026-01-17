package com.strategygameapp.dto.player;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PlayerResponse {
    private Long id;
    private int seat;
    private boolean bot;
    private boolean alive;
    private int lightning;
    private int wood;
    private int stone;
    private int glass;
    private int force;
}
