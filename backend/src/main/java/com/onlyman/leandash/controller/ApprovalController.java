package com.onlyman.leandash.controller;

import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.ApiResponse;
import com.onlyman.leandash.dto.ApprovalAdminListResponse;
import com.onlyman.leandash.dto.ApprovalApproveRequest;
import com.onlyman.leandash.dto.ApprovalCreateRequest;
import com.onlyman.leandash.dto.ApprovalListResponse;
import com.onlyman.leandash.dto.ApprovalRejectRequest;
import com.onlyman.leandash.dto.ApprovalResponse;
import com.onlyman.leandash.dto.FileAttachmentResponse;
import com.onlyman.leandash.service.ApprovalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/approvals")
public class ApprovalController {

    private final ApprovalService approvalService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApprovalResponse>> createApproval(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApprovalCreateRequest request
    ) {
        ApprovalResponse response = approvalService.createApproval(principal.getUserId(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "approval created successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ApprovalListResponse>>> getMyApprovals(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ApprovalListResponse> response = approvalService.getMyApprovals(principal.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "approvals retrieved successfully", response));
    }

    @GetMapping("/{approvalId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApprovalResponse>> getApproval(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long approvalId
    ) {
        ApprovalResponse response = approvalService.getApproval(principal.getUserId(), approvalId);
        return ResponseEntity.ok(new ApiResponse<>(true, "approval retrieved successfully", response));
    }

    @GetMapping("/department")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ApprovalAdminListResponse>>> getDepartmentApprovals(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ApprovalAdminListResponse> response = approvalService.getDepartmentApprovals(principal.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "department approvals retrieved successfully", response));
    }

    @GetMapping("/department/{approvalId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ApprovalResponse>> getDepartmentApproval(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long approvalId
    ) {
        ApprovalResponse response = approvalService.getDepartmentApproval(principal.getUserId(), approvalId);
        return ResponseEntity.ok(new ApiResponse<>(true, "department approval retrieved successfully", response));
    }

    @PatchMapping("/{approvalId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ApprovalResponse>> approveApproval(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long approvalId,
            @Valid @RequestBody ApprovalApproveRequest request
    ) {
        ApprovalResponse response = approvalService.approveApproval(principal.getUserId(), approvalId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "approval approved successfully", response));
    }

    @PatchMapping("/{approvalId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ApprovalResponse>> rejectApproval(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long approvalId,
            @Valid @RequestBody ApprovalRejectRequest request
    ) {
        ApprovalResponse response = approvalService.rejectApproval(principal.getUserId(), approvalId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "approval rejected successfully", response));
    }

    @PostMapping("/{approvalId}/files")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileAttachmentResponse>> uploadApprovalFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long approvalId,
            @RequestParam("file") MultipartFile file
    ) {
        FileAttachmentResponse response = approvalService.uploadApprovalFile(principal.getUserId(), approvalId, file);
        return ResponseEntity.ok(new ApiResponse<>(true, "approval attachment uploaded successfully", response));
    }

    @GetMapping("/{approvalId}/files/{fileId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadApprovalFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long approvalId,
            @PathVariable Long fileId
    ) {
        Resource resource = approvalService.downloadApprovalFile(principal.getUserId(), approvalId, fileId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(resource.getFilename(), StandardCharsets.UTF_8)
                        .build()
                        .toString())
                .body(resource);
    }
}
