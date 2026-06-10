package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.CompanyPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompanyPolicyRepository extends JpaRepository<CompanyPolicy, Long> {
    // 💥 제목(title)이나 내용(content)에 키워드가 포함된 규정 다 긁어오기!
    List<CompanyPolicy> findByContentContainingOrTitleContaining(String contentKeyword, String titleKeyword);
}