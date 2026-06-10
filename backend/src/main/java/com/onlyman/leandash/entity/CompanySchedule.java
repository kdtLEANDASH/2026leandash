package com.onlyman.leandash.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_schedules")
@Getter
@Setter
@NoArgsConstructor
public class CompanySchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleId;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDate scheduleDate; // 이건 DB에서 DATE 타입이라 LocalDate!
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}