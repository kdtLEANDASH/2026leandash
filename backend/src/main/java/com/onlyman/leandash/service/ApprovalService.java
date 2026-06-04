package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.ApprovalAdminListResponse;
import com.onlyman.leandash.dto.ApprovalApproveRequest;
import com.onlyman.leandash.dto.ApprovalCreateRequest;
import com.onlyman.leandash.dto.ApprovalListResponse;
import com.onlyman.leandash.dto.ApprovalRejectRequest;
import com.onlyman.leandash.dto.ApprovalResponse;
import com.onlyman.leandash.dto.FileAttachmentResponse;
import com.onlyman.leandash.entity.Approval;
import com.onlyman.leandash.entity.ApprovalStatus;
import com.onlyman.leandash.entity.ApprovalType;
import com.onlyman.leandash.entity.FileAttachment;
import com.onlyman.leandash.entity.Role;
import com.onlyman.leandash.entity.User;
import com.onlyman.leandash.repository.ApprovalRepository;
import com.onlyman.leandash.repository.FileAttachmentRepository;
import com.onlyman.leandash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final UserRepository userRepository;
    private final FileAttachmentRepository fileAttachmentRepository;

    @Transactional
    public ApprovalResponse createApproval(Long currentUserId, ApprovalCreateRequest request) {
        User user = getUserEntity(currentUserId);

        Approval approval = Approval.builder()
                .user(user)
                .department(user.getDepartment())
                .title(request.getTitle())
                .approvalType(ApprovalType.from(request.getApprovalType()))
                .content(request.getContent())
                .amount(request.getAmount())
                .status(ApprovalStatus.PENDING)
                .build();

        return toApprovalResponse(approvalRepository.save(approval));
    }

    public List<ApprovalListResponse> getMyApprovals(Long currentUserId) {
        return approvalRepository.findByUser_UserIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(ApprovalListResponse::from)
                .toList();
    }

    public ApprovalResponse getApproval(Long currentUserId, Long approvalId) {
        Approval approval = getApprovalEntity(approvalId);
        validateApprovalAccess(getUserEntity(currentUserId), approval);
        return toApprovalResponse(approval);
    }

    public List<ApprovalAdminListResponse> getDepartmentApprovals(Long currentUserId) {
        getAdminUserEntity(currentUserId);

        return approvalRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ApprovalAdminListResponse::from)
                .toList();
    }

    public ApprovalResponse getDepartmentApproval(Long currentUserId, Long approvalId) {
        User admin = getAdminUserEntity(currentUserId);
        Approval approval = getApprovalEntity(approvalId);

        validateDepartmentApproval(admin, approval);
        return toApprovalResponse(approval);
    }

    @Transactional
    public ApprovalResponse approveApproval(Long currentUserId, Long approvalId, ApprovalApproveRequest request) {
        User admin = getAdminUserEntity(currentUserId);
        Approval approval = getApprovalEntity(approvalId);

        validateDepartmentApproval(admin, approval);
        validatePendingApproval(approval);

        String signatureUrl = saveApprovalSignature(approvalId, request.getSignatureData());
        approval.approve(admin, signatureUrl);

        return toApprovalResponse(approval);
    }

    @Transactional
    public ApprovalResponse rejectApproval(Long currentUserId, Long approvalId, ApprovalRejectRequest request) {
        User admin = getAdminUserEntity(currentUserId);
        Approval approval = getApprovalEntity(approvalId);

        validateDepartmentApproval(admin, approval);
        validatePendingApproval(approval);

        approval.reject(admin, request.getRejectReason());
        return toApprovalResponse(approval);
    }

    @Transactional
    public FileAttachmentResponse uploadApprovalFile(Long currentUserId, Long approvalId, MultipartFile file) {
        Approval approval = getApprovalEntity(approvalId);
        validateApprovalOwner(getUserEntity(currentUserId), approval);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file is required");
        }

        User uploader = getUserEntity(currentUserId);
        String originalFileName = Path.of(file.getOriginalFilename()).getFileName().toString();
        String storedFileName = UUID.randomUUID() + "_" + originalFileName;
        Path uploadDir = Paths.get("uploads", "approvals", String.valueOf(approvalId)).toAbsolutePath().normalize();
        Path uploadPath = uploadDir.resolve(storedFileName);

        try {
            Files.createDirectories(uploadDir);
            Files.copy(file.getInputStream(), uploadPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("failed to store approval attachment", e);
        }

        FileAttachment attachment = FileAttachment.builder()
                .fileName(originalFileName)
                .fileUrl(uploadPath.toString().replace("\\", "/"))
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploader(uploader)
                .approval(approval)
                .build();

        return FileAttachmentResponse.from(fileAttachmentRepository.save(attachment));
    }

    public Resource downloadApprovalFile(Long currentUserId, Long approvalId, Long fileId) {
        User user = getUserEntity(currentUserId);
        Approval approval = getApprovalEntity(approvalId);
        validateApprovalAccess(user, approval);

        FileAttachment attachment = fileAttachmentRepository.findByFileIdAndApproval_ApprovalId(fileId, approvalId)
                .orElseThrow(() -> new IllegalArgumentException("attachment not found"));

        Path filePath = Paths.get(attachment.getFileUrl()).toAbsolutePath().normalize();

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalArgumentException("attachment file not found");
            }
            return resource;
        } catch (IOException e) {
            throw new IllegalStateException("failed to read approval attachment", e);
        }
    }

    private Approval getApprovalEntity(Long approvalId) {
        return approvalRepository.findById(approvalId)
                .orElseThrow(() -> new IllegalArgumentException("approval not found"));
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));
    }

    private User getAdminUserEntity(Long userId) {
        User user = getUserEntity(userId);

        if (user.getRoleEnum() != Role.ADMIN) {
            throw new IllegalArgumentException("only admins can access this approval operation");
        }

        return user;
    }

    private void validateApprovalOwner(User user, Approval approval) {
        if (!approval.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("you cannot upload a file to another user's approval");
        }
    }

    private void validateDepartmentApproval(User admin, Approval approval) {
        if (admin.getRoleEnum() != Role.ADMIN) {
            throw new IllegalArgumentException("only admins can manage approvals");
        }
    }

    private void validatePendingApproval(Approval approval) {
        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalArgumentException("only pending approvals can be processed");
        }
    }

    private void validateApprovalAccess(User user, Approval approval) {
        if (approval.getUser().getUserId().equals(user.getUserId())) {
            return;
        }

        if (user.getRoleEnum() == Role.ADMIN) {
            return;
        }

        throw new IllegalArgumentException("you cannot view another user's approval");
    }

    private String saveApprovalSignature(Long approvalId, String signatureData) {
        if (signatureData == null || signatureData.isBlank()) {
            return null;
        }

        String base64 = extractBase64Payload(signatureData);
        byte[] signatureBytes;

        try {
            signatureBytes = Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("invalid signature data");
        }

        Path uploadDir = Paths.get("uploads", "approvals", String.valueOf(approvalId)).toAbsolutePath().normalize();
        Path uploadPath = uploadDir.resolve("signature_" + LocalDateTime.now().toString().replace(":", "-") + ".png");

        try {
            Files.createDirectories(uploadDir);
            Files.write(uploadPath, signatureBytes);
        } catch (IOException e) {
            throw new IllegalStateException("failed to store approval signature", e);
        }

        return uploadPath.toString().replace("\\", "/");
    }

    private String extractBase64Payload(String signatureData) {
        String trimmed = signatureData.trim();
        int commaIndex = trimmed.indexOf(',');
        return commaIndex >= 0 ? trimmed.substring(commaIndex + 1) : trimmed;
    }

    private ApprovalResponse toApprovalResponse(Approval approval) {
        List<FileAttachmentResponse> attachments = fileAttachmentRepository
                .findByApproval_ApprovalIdOrderByCreatedAtAsc(approval.getApprovalId())
                .stream()
                .map(FileAttachmentResponse::from)
                .toList();

        return ApprovalResponse.from(approval, attachments);
    }
}
