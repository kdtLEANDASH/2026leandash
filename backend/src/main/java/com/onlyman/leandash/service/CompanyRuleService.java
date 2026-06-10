package com.onlyman.leandash.service;

import com.onlyman.leandash.entity.CompanyRule;
import com.onlyman.leandash.repository.CompanyRuleRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CompanyRuleService {
    private final CompanyRuleRepository repository;

    public CompanyRuleService(CompanyRuleRepository repository) {
        this.repository = repository;
    }

    public List<CompanyRule> getAllRules() {
        return repository.findAll();
    }
}