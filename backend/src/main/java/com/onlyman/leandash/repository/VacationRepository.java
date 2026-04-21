package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.Vacation;
import com.onlyman.leandash.entity.VacationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface VacationRepository extends JpaRepository<Vacation, Long> {

    List<Vacation> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Vacation> findByStatus(VacationStatus status);

    List<Vacation> findByUserIdAndStatus(Long userId, VacationStatus status);

    boolean existsByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long userId, LocalDate endDate, LocalDate startDate
    );

    long countByStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LocalDate endDate, LocalDate startDate
    );
}
