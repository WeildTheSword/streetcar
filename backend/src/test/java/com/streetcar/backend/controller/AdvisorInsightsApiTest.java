package com.streetcar.backend.controller;

import com.streetcar.backend.TestTokens;
import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.Conversation;
import com.streetcar.backend.model.JobApplication;
import com.streetcar.backend.model.Resume;
import com.streetcar.backend.model.StudentProfile;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AlumniProfileRepository;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.ConversationRepository;
import com.streetcar.backend.repository.JobApplicationRepository;
import com.streetcar.backend.repository.ResumeRepository;
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

import java.time.LocalDate;
import java.time.OffsetDateTime;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** The advisor's trends, performance, outcomes, reports and log, through the real mappings and schema.sql. */
@SpringBootTest
class AdvisorInsightsApiTest {
    private static final String[] ENDPOINTS = {"/advisor/insights/hiring", "/advisor/insights/performance",
            "/advisor/insights/outcomes", "/advisor/reports/students", "/advisor/logs"};

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
    @Autowired
    private JobApplicationRepository applications;
    @Autowired
    private ResumeRepository resumes;

    private MockMvc mvc;
    private long chrisId;
    private String advisor;
    private String student;

    @BeforeEach
    void seedStudentsWithApplicationsAndAnAlum() {
        resumes.deleteAll();
        applications.deleteAll();
        conversations.deleteAll();
        appointments.deleteAll();
        alumniProfiles.deleteAll();
        studentProfiles.deleteAll();
        submissions.deleteAll();
        users.deleteAll();
        User chris = users.save(new User("chris@tulane.edu", "not-a-real-hash", "STUDENT", "Chris Boudreaux"));
        User alex = users.save(new User("alex@tulane.edu", "not-a-real-hash", "STUDENT", "Alex Rivera"));
        User bill = users.save(new User("bill@tulane.edu", "not-a-real-hash", "ADVISOR", "Bill Hudlow"));
        User sarah = users.save(new User("sarah@alumni.tulane.edu", "not-a-real-hash", "ALUMNI", "Sarah Kim"));
        chrisId = chris.getId();
        studentProfiles.save(new StudentProfile(chris, "Junior"));
        alumniProfiles.save(new AlumniProfile(sarah, "Freeman · Finance", 2021, "Analyst · Goldman Sachs TMT",
                "New York, NY"));
        OffsetDateTime past = OffsetDateTime.now().minusDays(2);
        LocalDate appliedOn = LocalDate.now().minusDays(7);
        applications.save(new JobApplication(null, chris, "Goldman Sachs", "IB Summer Analyst", "offer", appliedOn,
                null, past));
        applications.save(new JobApplication(null, chris, "Moelis", "Summer Analyst", "interview", appliedOn,
                null, past));
        applications.save(new JobApplication(null, alex, "Goldman Sachs", "IB Summer Analyst", "applied", appliedOn,
                null, past));
        conversations.save(new Conversation(chris, sarah, "reply", "Happy to chat", past, false));
        appointments.save(new AdvisingAppointment(bill, chris, OffsetDateTime.now().minusDays(1), "Intro"));
        resumes.save(new Resume(chris, "Finance + CS", "", "", "", past));
        advisor = TestTokens.bearer(bill.getId(), "ADVISOR");
        student = TestTokens.bearer(chrisId, "STUDENT");
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    void hiringGroupsApplicationsAndAlumni() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/insights/hiring").header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentApplications[0].company").value("Goldman Sachs"))
                .andExpect(jsonPath("$.studentApplications[0].applications").value(2))
                .andExpect(jsonPath("$.studentApplications[0].offers").value(1))
                .andExpect(jsonPath("$.studentApplications[1].interviews").value(1))
                .andExpect(jsonPath("$.alumniEmployers[0].employer").value("Goldman Sachs TMT"))
                .andExpect(jsonPath("$.alumniCities[0].city").value("New York, NY"))
                .andExpect(jsonPath("$.totalApplications").value(3))
                .andExpect(jsonPath("$.totalAlumni").value(1));
    }

    @Test
    void performanceCountsTheAdvisorsSessions() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/insights/performance").header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.students").value(2))
                .andExpect(jsonPath("$.appointmentsTotal").value(1))
                .andExpect(jsonPath("$.completed").value(1))
                .andExpect(jsonPath("$.upcoming").value(0))
                .andExpect(jsonPath("$.studentsSeen").value(1))
                .andExpect(jsonPath("$.coveragePercent").value(50))
                .andExpect(jsonPath("$.weeks", hasSize(8)))
                .andExpect(jsonPath("$.weeks[0].weekStart").isString());
    }

    @Test
    void outcomesShowTheFunnelAndOffers() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/insights/outcomes").header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.funnel.applied").value(1))
                .andExpect(jsonPath("$.funnel.interview").value(1))
                .andExpect(jsonPath("$.funnel.offer").value(1))
                .andExpect(jsonPath("$.funnel.rejected").value(0))
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.offerRate").value(33))
                .andExpect(jsonPath("$.offers[0].studentId").value(chrisId))
                .andExpect(jsonPath("$.offers[0].company").value("Goldman Sachs"))
                .andExpect(jsonPath("$.byStudent[0].studentName").value("Chris Boudreaux"))
                .andExpect(jsonPath("$.byStudent[0].applications").value(2));
    }

    @Test
    void theStudentReportHasOneRowPerStudentByName() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/reports/students").header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Alex Rivera"))
                .andExpect(jsonPath("$[0].classYear").value(nullValue()))
                .andExpect(jsonPath("$[0].resume").value(false))
                .andExpect(jsonPath("$[1].email").value("chris@tulane.edu"))
                .andExpect(jsonPath("$[1].classYear").value("Junior"))
                .andExpect(jsonPath("$[1].applications").value(2))
                .andExpect(jsonPath("$[1].offers").value(1))
                .andExpect(jsonPath("$[1].appointments").value(1))
                .andExpect(jsonPath("$[1].conversations").value(1))
                .andExpect(jsonPath("$[1].submissions").value(0))
                .andExpect(jsonPath("$[1].resume").value(true));
    }

    @Test
    void theLogListsWhatStudentsDid() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/logs").header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].type", hasItem("signup")))
                .andExpect(jsonPath("$[*].type", hasItem("application")))
                .andExpect(jsonPath("$[*].type", hasItem("conversation")))
                .andExpect(jsonPath("$[*].type", hasItem("resume")))
                .andExpect(jsonPath("$[*].detail", hasItem("Met with Bill Hudlow")))
                .andExpect(jsonPath("$[*].detail", hasItem("Goldman Sachs · IB Summer Analyst: offer")))
                .andExpect(jsonPath("$[*].actor", hasItem("Chris Boudreaux")));
    }

    @Test
    void aStudentIsRefusedEveryAdvisorInsight() throws Exception {
        // Act and Assert
        for (String endpoint : ENDPOINTS) {
            mvc.perform(get(endpoint).header(HttpHeaders.AUTHORIZATION, student)).andExpect(status().isForbidden());
        }
    }

    @Test
    void withoutATokenEveryAdvisorInsightAsksForSignIn() throws Exception {
        // Act and Assert
        for (String endpoint : ENDPOINTS) {
            mvc.perform(get(endpoint)).andExpect(status().isUnauthorized());
        }
    }
}
