package com.example.user_management.controller;

import com.example.user_management.dto.*;
import com.example.user_management.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST /api/users/register
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody UserRegisterRequest request) {
        return userService.register(request);
    }

    // POST /api/users/login
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody UserLoginRequest request) {
        return userService.login(request);
    }

    // GET /api/users/{id}
    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // GET /api/users (admin only)
    @GetMapping
    //@PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAll() {
        return userService.getAllUsers();
    }

    // PATCH /api/users/{id}
    @PatchMapping("/{id}")
    public UserResponse update(@PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        return userService.updateUser(id, request);
    }

    // POST /api/users/{id}/wins/increment
    @PostMapping("/{id}/wins/increment")
    public UserResponse incrementWins(@PathVariable Long id) {
        return userService.incrementGamesWon(id);
    }
}
