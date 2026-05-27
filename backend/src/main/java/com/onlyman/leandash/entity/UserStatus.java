package com.onlyman.leandash.entity;

import java.util.Arrays;

public enum UserStatus {
    ONLINE,
    OFFLINE,
    AWAY,
    SEAT_OUT;

    public static UserStatus from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("user status is required");
        }

        String normalized = value.trim().toUpperCase()
                .replace('-', '_')
                .replace(' ', '_');

        return Arrays.stream(values())
                .filter(status -> status.name().equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("unsupported user status"));
    }
}
