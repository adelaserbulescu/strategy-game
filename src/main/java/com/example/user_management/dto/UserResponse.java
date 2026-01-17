package com.example.user_management.dto;

import com.example.user_management.model.UserRole;

import java.time.Instant;

public class UserResponse {

    private Long id;
    private String username;
    private String description;
    private int gamesWon;
    private UserRole role;
    private Instant createdAt;
    private Instant updatedAt;

    public UserResponse() {
    }

    public UserResponse(Long id,
                        String username,
                        String description,
                        int gamesWon,
                        UserRole role,
                        Instant createdAt,
                        Instant updatedAt) {
        this.id = id;
        this.username = username;
        this.description = description;
        this.gamesWon = gamesWon;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // getters & setters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getDescription() {
        return description;
    }

    public int getGamesWon() {
        return gamesWon;
    }

    public UserRole getRole() {
        return role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setGamesWon(int gamesWon) {
        this.gamesWon = gamesWon;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
