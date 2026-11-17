package com.streetcar.backend.controller;

import com.streetcar.backend.TestTokens;
import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.Conversation;
import com.streetcar.backend.model.StudentProfile;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AlumniProfileRepository;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.ConversationRepository;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.SubmissionRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Every role's own account page, built from the users row and the tables that point at it. */
@SpringBootTest
class AccountApiTest {
    @Autowired
    private WebApplicationContext context;
    @Autowired
    private UserRepository users;
    @Autowired
    private SubmissionRepository submissions;
    @Autowired
    private StudentProfileRepository studentProfiles;
    @Autowired
    private AlumniProfileRepository alumniProfiles;
    @Autowired
    private AppointmentRepository appointments;
    @Autowired
    private ConversationRepository conversations;

    private MockMvc mvc;
    private long chrisId;
    private long billId;
    private long sarahId;

    @BeforeEach
    void seedOneAccountOfEachRole() {
        conversations.deleteAll();
        appointments.deleteAll();
        alumniProfiles.deleteAll();
        studentProfiles.deleteAll();
        submissions.deleteAll();
        users.deleteAll();
        User chris = users.save(new User("chris@tulane.edu", "not-a-real-hash", "STUDENT", "Chris Boudreaux"));
        User bill = users.save(new User("bill@tulane.edu", "not-a-real-hash", "ADVISOR", "Bill Hudlow"));
        User sarah = users.save(new User("sarah@alumni.tulane.edu", "not-a-real-hash", "ALUMNI", "Sarah Kim"));
        chrisId = chris.getId();
        billId = bill.getId();
        sarahId = sarah.getId();
        studentProfiles.save(new StudentProfile(chris, "Junior"));
        alumniProfiles.save(new AlumniProfile(sarah, "Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY"));
        submissions.save(new Submission(null, new BigDecimal("3.50"), "CMPS 1500", "Finance", "Analyst", null)
                .withIdentity(null, null, chris));
        appointments.save(new AdvisingAppointment(bill, chris, OffsetDateTime.parse("2026-11-18T15:30:00Z"), "First session"));
        conversations.save(new Conversation(chris, sarah, "reply", "Happy to chat", OffsetDateTime.now(), true));
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    void aStudentSeesTheirAccount() throws Exception {
        // Act and Assert
        mvc.perform(get("/account").header(HttpHeaders.AUTHORIZATION, TestTokens.bearer(chrisId, "STUDENT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Chris Boudreaux"))
                .andExpect(jsonPath("$.email").value("chris@tulane.edu"))
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.classYear").value("Junior"))
                .andExpect(jsonPath("$.alumni").value(nullValue()))
                .andExpect(jsonPath("$.submissionCount").value(1))
                .andExpect(jsonPath("$.appointments[0].withName").value("Bill Hudlow"))
                .andExpect(jsonPath("$.appointments[0].tags[0]").value("First session"))
                .andExpect(jsonPath("$.conversations[0].withName").value("Sarah Kim"))
                .andExpect(jsonPath("$.conversations[0].statusLabel").value("Replied"));
    }

    @Test
    void anAdvisorSeesTheirAccount() throws Exception {
        // Act and Assert
        mvc.perform(get("/account").header(HttpHeaders.AUTHORIZATION, TestTokens.bearer(billId, "ADVISOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADVISOR"))
                .andExpect(jsonPath("$.classYear").value(nullValue()))
                .andExpect(jsonPath("$.appointments", hasSize(1)))
                .andExpect(jsonPath("$.appointments[0].withName").value("Chris Boudreaux"))
                .andExpect(jsonPath("$.conversations", hasSize(0)));
    }

    @Test
    void anAlumSeesTheirAccount() throws Exception {
        // Act and Assert
        mvc.perform(get("/account").header(HttpHeaders.AUTHORIZATION, TestTokens.bearer(sarahId, "ALUMNI")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ALUMNI"))
                .andExpect(jsonPath("$.alumni.school").value("Freeman · Finance"))
                .andExpect(jsonPath("$.alumni.gradYear").value(2016))
                .andExpect(jsonPath("$.alumni.currentRole").value("Goldman Sachs IBD"))
                .andExpect(jsonPath("$.alumni.city").value("New York, NY"))
                .andExpect(jsonPath("$.conversations[0].withName").value("Chris Boudreaux"));
    }

    @Test
    void anAccountThatNoLongerExistsIsNotFound() throws Exception {
        // Act and Assert
        mvc.perform(get("/account").header(HttpHeaders.AUTHORIZATION, TestTokens.bearer(999_999, "STUDENT")))
                .andExpect(status().isNotFound());
    }

    @Test
    void withoutATokenTheAccountAsksForSignIn() throws Exception {
        // Act and Assert
        mvc.perform(get("/account")).andExpect(status().isUnauthorized());
    }
}
