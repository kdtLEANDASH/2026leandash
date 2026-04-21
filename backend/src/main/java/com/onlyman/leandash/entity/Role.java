package com.onlyman.leandash.entity;

import java.util.Arrays;

public enum Role {
    USER,
    ADMIN;

    public static Role from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("권한 값은 비워둘 수 없습니다.");
        }

        String normalized = value.trim().toUpperCase()
                .replace('-', '_')
                .replace(' ', '_');

        return Arrays.stream(values())
                .filter(role -> role.name().equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("지원하지 않는 권한입니다."));
    }
}
