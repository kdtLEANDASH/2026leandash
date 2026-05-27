package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.FileAttachmentResponse;
import com.onlyman.leandash.dto.InquiryCreateRequest;
import com.onlyman.leandash.dto.InquiryAdminListResponse;
import com.onlyman.leandash.dto.InquiryAnswerRequest;
import com.onlyman.leandash.dto.InquiryListResponse;
import com.onlyman.leandash.dto.InquiryResponse;
import com.onlyman.leandash.entity.FileAttachment;
import com.onlyman.leandash.entity.Inquiry;
import com.onlyman.leandash.entity.InquiryStatus;
import com.onlyman.leandash.entity.Role;
import com.onlyman.leandash.entity.User;
import com.onlyman.leandash.repository.FileAttachmentRepository;
import com.onlyman.leandash.repository.InquiryRepository;
import com.onlyman.leandash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final FileAttachmentRepository fileAttachmentRepository;

    @Transactional
    public InquiryResponse createInquiry(Long currentUserId, InquiryCreateRequest request) {
        User user = getUserEntity(currentUserId);

        Inquiry inquiry = Inquiry.builder()
                .user(user)
                .department(user.getDepartment())
                .title(request.getTitle())
                .content(request.getContent())
                .status(InquiryStatus.PENDING)
                .build();

        return toInquiryResponse(inquiryRepository.save(inquiry));
    }

    public List<InquiryListResponse> getMyInquiries(Long currentUserId) {
        return inquiryRepository.findByUser_UserIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(InquiryListResponse::from)
                .toList();
    }

    public InquiryResponse getInquiry(Long currentUserId, Long inquiryId) {
        Inquiry inquiry = getInquiryEntity(inquiryId);
        validateInquiryAccess(getUserEntity(currentUserId), inquiry);

        return toInquiryResponse(inquiry);
    }

    public List<InquiryAdminListResponse> getDepartmentInquiries(Long currentUserId) {
        User admin = getAdminUserEntity(currentUserId);

        return inquiryRepository.findByDepartment_DepartmentIdOrderByCreatedAtDesc(admin.getDepartment().getDepartmentId()).stream()
                .map(InquiryAdminListResponse::from)
                .toList();
    }

    public InquiryResponse getDepartmentInquiry(Long currentUserId, Long inquiryId) {
        User admin = getAdminUserEntity(currentUserId);
        Inquiry inquiry = getInquiryEntity(inquiryId);

        if (!inquiry.getDepartment().getDepartmentId().equals(admin.getDepartment().getDepartmentId())) {
            throw new IllegalArgumentException("you can only view inquiries from your department");
        }

        return toInquiryResponse(inquiry);
    }

    @Transactional
    public InquiryResponse answerInquiry(Long currentUserId, Long inquiryId, InquiryAnswerRequest request) {
        User admin = getAdminUserEntity(currentUserId);
        Inquiry inquiry = getInquiryEntity(inquiryId);

        if (!inquiry.getDepartment().getDepartmentId().equals(admin.getDepartment().getDepartmentId())) {
            throw new IllegalArgumentException("you can only answer inquiries from your department");
        }

        inquiry.answer(admin, request.getAnswerContent());
        return toInquiryResponse(inquiry);
    }

    @Transactional
    public FileAttachmentResponse uploadInquiryFile(Long currentUserId, Long inquiryId, MultipartFile file) {
        Inquiry inquiry = getInquiryEntity(inquiryId);
        validateInquiryOwner(getUserEntity(currentUserId), inquiry);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file is required");
        }

        User uploader = getUserEntity(currentUserId);
        String originalFileName = Path.of(file.getOriginalFilename()).getFileName().toString();
        String storedFileName = UUID.randomUUID() + "_" + originalFileName;
        Path uploadDir = Paths.get("uploads", "inquiries", String.valueOf(inquiryId)).toAbsolutePath().normalize();
        Path uploadPath = uploadDir.resolve(storedFileName);

        try {
            Files.createDirectories(uploadDir);
            Files.copy(file.getInputStream(), uploadPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("failed to store inquiry attachment", e);
        }

        FileAttachment attachment = FileAttachment.builder()
                .fileName(originalFileName)
                .fileUrl(uploadPath.toString().replace("\\", "/"))
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploader(uploader)
                .inquiry(inquiry)
                .build();

        return FileAttachmentResponse.from(fileAttachmentRepository.save(attachment));
    }

    public Resource downloadInquiryFile(Long currentUserId, Long inquiryId, Long fileId) {
        User user = getUserEntity(currentUserId);
        Inquiry inquiry = getInquiryEntity(inquiryId);
        validateInquiryAccess(user, inquiry);

        FileAttachment attachment = fileAttachmentRepository.findByFileIdAndInquiry_InquiryId(fileId, inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("attachment not found"));

        Path filePath = Paths.get(attachment.getFileUrl()).toAbsolutePath().normalize();

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalArgumentException("attachment file not found");
            }
            return resource;
        } catch (IOException e) {
            throw new IllegalStateException("failed to read inquiry attachment", e);
        }
    }

    private Inquiry getInquiryEntity(Long inquiryId) {
        return inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("inquiry not found"));
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));
    }

    private User getAdminUserEntity(Long userId) {
        User user = getUserEntity(userId);

        if (user.getRoleEnum() != Role.ADMIN) {
            throw new IllegalArgumentException("only admins can access this inquiry operation");
        }

        return user;
    }

    private void validateInquiryOwner(User user, Inquiry inquiry) {
        if (!inquiry.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("you cannot upload a file to another user's inquiry");
        }
    }

    private void validateInquiryAccess(User user, Inquiry inquiry) {
        if (inquiry.getUser().getUserId().equals(user.getUserId())) {
            return;
        }

        if (user.getRoleEnum() == Role.ADMIN
                && inquiry.getDepartment().getDepartmentId().equals(user.getDepartment().getDepartmentId())) {
            return;
        }

        throw new IllegalArgumentException("you cannot view another user's inquiry");
    }

    private InquiryResponse toInquiryResponse(Inquiry inquiry) {
        List<FileAttachmentResponse> attachments = fileAttachmentRepository
                .findByInquiry_InquiryIdOrderByCreatedAtAsc(inquiry.getInquiryId())
                .stream()
                .map(FileAttachmentResponse::from)
                .toList();

        return InquiryResponse.from(inquiry, attachments);
    }
}
