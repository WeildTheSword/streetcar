package com.streetcar.backend.config;

import com.streetcar.backend.service.AuthService;
import com.streetcar.backend.service.DirectorySeeder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;

/**
 * Makes sure the two demo accounts in DEMO.md exist once the app has started,
 * then the seeded directory around them: alumni, more students, Morgan's
 * conversations and Bill's appointments for the day.
 */
@Component
public class DemoAccountSeeder implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DemoAccountSeeder.class);
    private static final String ADVISOR_EMAIL = "bill.hudlow@tulane.edu";

    private final AuthService auth;
    private final DirectorySeeder directory;

    public DemoAccountSeeder(AuthService auth, DirectorySeeder directory) {
        this.auth = auth;
        this.directory = directory;
    }

    @Override
    public void run(ApplicationArguments args) {
        auth.ensureDemoAccounts();
        try {
            directory.ensureDirectory(ADVISOR_EMAIL);
        } catch (DataAccessException failed) {
            // A local H2 file created before the ALUMNI role keeps its old role check.
            // The app still runs; deleting backend/data lets schema.sql recreate it.
            log.warn("Could not seed the alumni and appointments directory: {}", failed.getMostSpecificCause().getMessage());
        }
    }
}
