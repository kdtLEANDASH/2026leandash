package com.onlyman.leandash.controller;

import com.onlyman.leandash.entity.CompanyRule;
import com.onlyman.leandash.service.CompanyRuleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/rules")
public class CompanyRuleController {
    private final CompanyRuleService service;

    public CompanyRuleController(CompanyRuleService service) {
        this.service = service;
    }

    @GetMapping
    public List<CompanyRule> getRules() {
        return service.getAllRules();
    }
}