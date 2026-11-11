package com.streetcar.backend.config;

import com.streetcar.backend.service.AuthService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** Makes sure the two demo accounts in DEMO.md exist once the app has started. */
@Component
public class DemoAccountSeeder implements ApplicationRunner {

    private final AuthService auth;

    public DemoAccountSeeder(AuthService auth) {
        this.auth = auth;
    }

    @Override
    public void run(ApplicationArguments args) {
        auth.ensureDemoAccounts();
    }
}
