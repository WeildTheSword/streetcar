package com.streetcar.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/** "Today" and appointment times are Tulane's, Central time, wherever the server runs. */
@Configuration
public class ClockConfig {
    @Bean
    Clock clock() {
        return Clock.system(ZoneId.of("America/Chicago"));
    }
}
