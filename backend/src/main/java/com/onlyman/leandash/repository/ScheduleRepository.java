package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByUserId(Long userId);

    List<Schedule> findByScheduleType(String scheduleType);

    List<Schedule> findByUserIdAndScheduleType(Long userId, String scheduleType);
}
