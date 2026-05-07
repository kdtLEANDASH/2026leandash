package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.Vacation;
import com.onlyman.leandash.entity.VacationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface VacationRepository extends JpaRepository<Vacation, Long> {

    List<Vacation> findByUserId(Long userId);

    List<Vacation> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Vacation> findByStatus(VacationStatus status);

    long countByStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LocalDate endDate,
            LocalDate startDate
    );

    List<Vacation> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            VacationStatus status,
            LocalDate endDate,
            LocalDate startDate
    );
}