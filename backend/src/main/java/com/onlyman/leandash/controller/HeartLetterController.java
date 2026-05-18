package com.onlyman.leandash.controller;

import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.ApiResponse;
import com.onlyman.leandash.dto.HeartLetterAdminListResponse;
import com.onlyman.leandash.dto.HeartLetterCreateRequest;
import com.onlyman.leandash.dto.HeartLetterListResponse;
import com.onlyman.leandash.dto.HeartLetterResponse;
import com.onlyman.leandash.service.HeartLetterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/heart-letters")
public class HeartLetterController {

    private final HeartLetterService heartLetterService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<HeartLetterResponse>> createHeartLetter(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody HeartLetterCreateRequest request
    ) {
        HeartLetterResponse response = heartLetterService.createHeartLetter(principal.getUserId(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "heart letter created successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<HeartLetterListResponse>>> getMyHeartLetters(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<HeartLetterListResponse> response = heartLetterService.getMyHeartLetters(principal.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "heart letters retrieved successfully", response));
    }

    @GetMapping("/me/{heartLetterId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<HeartLetterResponse>> getMyHeartLetter(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long heartLetterId
    ) {
        HeartLetterResponse response = heartLetterService.getMyHeartLetter(principal.getUserId(), heartLetterId);
        return ResponseEntity.ok(new ApiResponse<>(true, "heart letter retrieved successfully", response));
    }

    @GetMapping("/received")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<HeartLetterAdminListResponse>>> getReceivedHeartLetters(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<HeartLetterAdminListResponse> response = heartLetterService.getReceivedHeartLetters(principal.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "received heart letters retrieved successfully", response));
    }

    @GetMapping("/received/{heartLetterId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HeartLetterResponse>> getReceivedHeartLetter(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long heartLetterId
    ) {
        HeartLetterResponse response = heartLetterService.getReceivedHeartLetter(principal.getUserId(), heartLetterId);
        return ResponseEntity.ok(new ApiResponse<>(true, "received heart letter retrieved successfully", response));
    }
}
