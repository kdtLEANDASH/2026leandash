package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Document;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DocumentResponse {

    private Long documentId;
    private String title;
    private String description;
    private String department;
    private Long uploaderId;
    private String uploaderName;
    private String originalFileName;
    private Long fileSize;
    private String contentType;
    private LocalDateTime createdAt;

    public static DocumentResponse from(Document document) {
        return DocumentResponse.builder()
                .documentId(document.getDocumentId())
                .title(document.getTitle())
                .description(document.getDescription())
                .department(document.getDepartment())
                .uploaderId(document.getUploaderId())
                .uploaderName(document.getUploaderName())
                .originalFileName(document.getOriginalFileName())
                .fileSize(document.getFileSize())
                .contentType(document.getContentType())
                .createdAt(document.getCreatedAt())
                .build();
    }
}