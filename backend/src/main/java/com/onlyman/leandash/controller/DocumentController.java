package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.ApiResponse;
import com.onlyman.leandash.dto.DocumentResponse;
import com.onlyman.leandash.entity.Document;
import com.onlyman.leandash.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getDocuments(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department
    ) {
        List<DocumentResponse> documents = documentService.getDocuments(keyword, department);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "documents loaded", documents)
        );
    }

    @GetMapping("/{documentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocument(
            @PathVariable Long documentId
    ) {
        DocumentResponse document = documentService.getDocument(documentId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "document loaded", document)
        );
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @RequestParam Long uploaderId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam String department,
            @RequestParam MultipartFile file
    ) {
        DocumentResponse document = documentService.uploadDocument(
                uploaderId,
                title,
                description,
                department,
                file
        );

        return ResponseEntity.ok(
                new ApiResponse<>(true, "document uploaded", document)
        );
    }

    @GetMapping("/{documentId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId
    ) {
        Document document = documentService.getDocumentEntity(documentId);
        Resource resource = documentService.downloadDocument(documentId);

        String encodedFileName = URLEncoder.encode(
                document.getOriginalFileName(),
                StandardCharsets.UTF_8
        ).replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encodedFileName
                )
                .body(resource);
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long documentId
    ) {
        documentService.deleteDocument(documentId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "document deleted", null)
        );
    }
}