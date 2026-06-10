package com.onlyman.leandash.controller;

import com.onlyman.leandash.entity.CompanySchedule;
import com.onlyman.leandash.service.CompanyScheduleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/company-schedules")
public class CompanyScheduleController {
    private final CompanyScheduleService service;

    public CompanyScheduleController(CompanyScheduleService service) {
        this.service = service;
    }

    @GetMapping
    public List<CompanySchedule> getSchedules() {
        return service.getAllSchedules();
    }
}