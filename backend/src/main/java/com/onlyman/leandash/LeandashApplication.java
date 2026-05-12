package com.onlyman.leandash;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class LeandashApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeandashApplication.class, args);
    }
}