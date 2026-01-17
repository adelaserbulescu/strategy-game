package com.example.user_management.dto;

import jakarta.validation.constraints.Size;

public class UserUpdateRequest {

    @Size(min = 3, max = 50)
    private String username;

    @Size(max = 255)
    private String description;

    public UserUpdateRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
