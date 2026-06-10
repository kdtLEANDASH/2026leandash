package com.onlyman.leandash.service;

import com.onlyman.leandash.entity.CompanySchedule;
import com.onlyman.leandash.repository.CompanyScheduleRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CompanyScheduleService {
    private final CompanyScheduleRepository repository;

    public CompanyScheduleService(CompanyScheduleRepository repository) {
        this.repository = repository;
    }

    public List<CompanySchedule> getAllSchedules() {
        return repository.findAll();
    }
}