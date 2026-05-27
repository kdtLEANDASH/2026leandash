package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.FileAttachment;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class FileAttachmentResponse {

    private Long fileId;
    private String fileName;
    private String fileUrl;
    private String downloadUrl;
    private String fileType;
    private Long fileSize;
    private LocalDateTime createdAt;

    public static FileAttachmentResponse from(FileAttachment fileAttachment) {
        return new FileAttachmentResponse(
                fileAttachment.getFileId(),
                fileAttachment.getFileName(),
                fileAttachment.getFileUrl(),
                "/api/inquiries/" + fileAttachment.getInquiry().getInquiryId() + "/files/" + fileAttachment.getFileId() + "/download",
                fileAttachment.getFileType(),
                fileAttachment.getFileSize(),
                fileAttachment.getCreatedAt()
        );
    }
}
