package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.DocumentResponse;
import com.onlyman.leandash.entity.Document;
import com.onlyman.leandash.entity.User;
import com.onlyman.leandash.repository.DocumentRepository;
import com.onlyman.leandash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir:uploads/documents}")
    private String uploadDir;

    public List<DocumentResponse> getDocuments(String keyword, String department) {
        List<Document> documents;

        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasDepartment = department != null && !department.trim().isEmpty()
                && !"전체".equals(department);

        if (hasKeyword) {
            documents = documentRepository
                    .findByTitleContainingIgnoreCaseOrOriginalFileNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                            keyword,
                            keyword,
                            keyword
                    );
        } else if (hasDepartment) {
            documents = documentRepository.findByDepartment(department);
        } else {
            documents = documentRepository.findAll();
        }

        if (hasDepartment && hasKeyword) {
            documents = documents.stream()
                    .filter(document -> department.equals(document.getDepartment()))
                    .toList();
        }

        return documents.stream()
                .map(DocumentResponse::from)
                .toList();
    }

    public DocumentResponse getDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));

        return DocumentResponse.from(document);
    }

    public DocumentResponse uploadDocument(
            Long uploaderId,
            String title,
            String description,
            String department,
            MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalFileName = file.getOriginalFilename();
            String extension = "";

            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String storedFileName = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(storedFileName);

            file.transferTo(filePath.toFile());

            Document document = Document.builder()
                    .title(title)
                    .description(description)
                    .department(department)
                    .uploaderId(uploader.getUserId())
                    .uploaderName(uploader.getUserName())
                    .originalFileName(originalFileName)
                    .storedFileName(storedFileName)
                    .filePath(filePath.toString())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .build();

            return DocumentResponse.from(documentRepository.save(document));
        } catch (Exception e) {
            throw new RuntimeException("문서 업로드에 실패했습니다.", e);
        }
    }

    public Resource downloadDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));

        try {
            Path filePath = Paths.get(document.getFilePath()).toAbsolutePath().normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new IllegalArgumentException("파일을 찾을 수 없습니다.");
            }

            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("파일 다운로드에 실패했습니다.", e);
        }
    }

    public Document getDocumentEntity(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));
    }

    public void deleteDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));

        try {
            Path filePath = Paths.get(document.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (Exception ignored) {
        }

        documentRepository.delete(document);
    }
}