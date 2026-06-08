package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByTitleContainingIgnoreCaseOrOriginalFileNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title,
            String originalFileName,
            String description
    );

    List<Document> findByDepartment(String department);
}