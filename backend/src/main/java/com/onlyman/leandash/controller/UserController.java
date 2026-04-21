package com.onlyman.leandash.controller;

import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.UserCreateRequest;
import com.onlyman.leandash.dto.UserLoginRequest;
import com.onlyman.leandash.dto.UserLoginResponse;
import com.onlyman.leandash.dto.UserResponse;
import com.onlyman.leandash.dto.UserRoleUpdateRequest;
import com.onlyman.leandash.dto.UserSearchRequest;
import com.onlyman.leandash.dto.UserStatusUpdateRequest;
import com.onlyman.leandash.dto.UserUpdateRequest;
import com.onlyman.leandash.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        UserLoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserResponse>> searchUsers(@ModelAttribute UserSearchRequest request) {
        return ResponseEntity.ok(userService.searchUsers(request));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getMyProfile(principal.getUserId()));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateMyProfile(principal.getUserId(), request));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserRole(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateUserRole(principal.getUserId(), userId, request));
    }

    @PatchMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateUserStatus(userId, request));
    }
}
