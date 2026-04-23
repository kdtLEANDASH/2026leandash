package com.onlyman.leandash.controller;

import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.ApiResponse;
import com.onlyman.leandash.dto.NoticeCreateRequest;
import com.onlyman.leandash.dto.NoticeListResponse;
import com.onlyman.leandash.dto.NoticeResponse;
import com.onlyman.leandash.dto.NoticeUpdateRequest;
import com.onlyman.leandash.service.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeService noticeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NoticeResponse>> createNotice(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody NoticeCreateRequest request
    ) {
        NoticeResponse response = noticeService.createNotice(principal.getUserId(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "notice created successfully", response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NoticeListResponse>>> getNotices() {
        List<NoticeListResponse> response = noticeService.getNotices();
        return ResponseEntity.ok(new ApiResponse<>(true, "notices retrieved successfully", response));
    }

    @GetMapping("/{noticeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NoticeResponse>> getNotice(@PathVariable Long noticeId) {
        NoticeResponse response = noticeService.getNotice(noticeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "notice retrieved successfully", response));
    }

    @PutMapping("/{noticeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NoticeResponse>> updateNotice(
            @PathVariable Long noticeId,
            @Valid @RequestBody NoticeUpdateRequest request
    ) {
        NoticeResponse response = noticeService.updateNotice(noticeId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "notice updated successfully", response));
    }

    @DeleteMapping("/{noticeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteNotice(@PathVariable Long noticeId) {
        noticeService.deleteNotice(noticeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "notice deleted successfully", null));
    }
}
