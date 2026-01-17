package com.strategygameapp.dto.match;

import lombok.Data;
import java.util.List;

@Data
public class CreateMatchRequest {
    private int players;
    private int width;
    private int height;
    private List<Boolean> bots;
}
