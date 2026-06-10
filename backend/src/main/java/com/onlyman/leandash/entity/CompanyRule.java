package com.onlyman.leandash.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_rules")
@Getter
@Setter
@NoArgsConstructor
public class CompanyRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ruleId;
    private String category;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}