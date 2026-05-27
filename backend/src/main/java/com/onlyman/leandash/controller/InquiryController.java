package com.onlyman.leandash.controller;

import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.ApiResponse;
import com.onlyman.leandash.dto.FileAttachmentResponse;
import com.onlyman.leandash.dto.InquiryAdminListResponse;
import com.onlyman.leandash.dto.InquiryAnswerRequest;
import com.onlyman.leandash.dto.InquiryCreateRequest;
import com.onlyman.leandash.dto.InquiryListResponse;
import com.onlyman.leandash.dto.InquiryResponse;
import com.onlyman.leandash.service.InquiryService;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
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

    @GetMapping("/department")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<InquiryAdminListResponse>>> getDepartmentInquiries(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<InquiryAdminListResponse> response = inquiryService.getDepartmentInquiries(principal.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "department inquiries retrieved successfully", response));
    }

    @GetMapping("/department/{inquiryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InquiryResponse>> getDepartmentInquiry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long inquiryId
    ) {
        InquiryResponse response = inquiryService.getDepartmentInquiry(principal.getUserId(), inquiryId);
        return ResponseEntity.ok(new ApiResponse<>(true, "department inquiry retrieved successfully", response));
    }

    @PatchMapping("/{inquiryId}/answer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InquiryResponse>> answerInquiry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long inquiryId,
            @Valid @RequestBody InquiryAnswerRequest request
    ) {
        InquiryResponse response = inquiryService.answerInquiry(principal.getUserId(), inquiryId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "inquiry answered successfully", response));
    }

    @PostMapping("/{inquiryId}/files")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileAttachmentResponse>> uploadInquiryFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long inquiryId,
            @RequestParam("file") MultipartFile file
    ) {
        FileAttachmentResponse response = inquiryService.uploadInquiryFile(principal.getUserId(), inquiryId, file);
        return ResponseEntity.ok(new ApiResponse<>(true, "inquiry attachment uploaded successfully", response));
    }

    @GetMapping("/{inquiryId}/files/{fileId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadInquiryFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long inquiryId,
            @PathVariable Long fileId
    ) {
        Resource resource = inquiryService.downloadInquiryFile(principal.getUserId(), inquiryId, fileId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(resource.getFilename(), StandardCharsets.UTF_8)
                        .build()
                        .toString())
                .body(resource);
    }
}
