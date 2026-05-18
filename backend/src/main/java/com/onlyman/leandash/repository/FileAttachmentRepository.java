package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.FileAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileAttachmentRepository extends JpaRepository<FileAttachment, Long> {

    List<FileAttachment> findByInquiry_InquiryIdOrderByCreatedAtAsc(Long inquiryId);

    Optional<FileAttachment> findByFileIdAndInquiry_InquiryId(Long fileId, Long inquiryId);
}
