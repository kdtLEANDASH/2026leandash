package com.onlyman.leandash.controller;

import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.ApiResponse;
import com.onlyman.leandash.dto.InquiryCreateRequest;
import com.onlyman.leandash.dto.InquiryListResponse;
import com.onlyman.leandash.dto.InquiryResponse;
import com.onlyman.leandash.service.InquiryService;
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
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<InquiryResponse>> createInquiry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InquiryCreateRequest request
    ) {
        InquiryResponse response = inquiryService.createInquiry(principal.getUserId(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "inquiry created successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<InquiryListResponse>>> getMyInquiries(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<InquiryListResponse> response = inquiryService.getMyInquiries(principal.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "inquiries retrieved successfully", response));
    }

    @GetMapping("/{inquiryId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<InquiryResponse>> getInquiry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long inquiryId
    ) {
        InquiryResponse response = inquiryService.getInquiry(principal.getUserId(), inquiryId);
        return ResponseEntity.ok(new ApiResponse<>(true, "inquiry retrieved successfully", response));
    }
}
