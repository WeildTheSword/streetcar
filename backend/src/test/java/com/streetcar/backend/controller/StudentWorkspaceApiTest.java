package com.streetcar.backend.controller;

import com.jayway.jsonpath.JsonPath;
import com.streetcar.backend.TestTokens;
import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.Conversation;
import com.streetcar.backend.model.JobApplication;
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
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** A student's own tabs under /me, through the real mappings, security and schema.sql. */
@SpringBootTest
class StudentWorkspaceApiTest {
    private static final String TODAY = LocalDate.now(ZoneId.of("America/Chicago")).toString();

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
    private long billId;
    private long sarahId;
    private long rahulId;
    private String chris;
    private String alex;
    private String advisor;
    private String alum;

    @BeforeEach
    void seedTwoStudentsAnAdvisorAndTwoAlumni() {
        resumes.deleteAll();
        applications.deleteAll();
        conversations.deleteAll();
        appointments.deleteAll();
        alumniProfiles.deleteAll();
        studentProfiles.deleteAll();
        submissions.deleteAll();
        users.deleteAll();
        User chrisUser = users.save(new User("chris@tulane.edu", "not-a-real-hash", "STUDENT", "Chris Boudreaux"));
        User alexUser = users.save(new User("alex@tulane.edu", "not-a-real-hash", "STUDENT", "Alex Rivera"));
        User bill = users.save(new User("bill@tulane.edu", "not-a-real-hash", "ADVISOR", "Bill Hudlow"));
        User sarah = users.save(new User("sarah@alumni.tulane.edu", "not-a-real-hash", "ALUMNI", "Sarah Kim"));
        User rahul = users.save(new User("rahul@alumni.tulane.edu", "not-a-real-hash", "ALUMNI", "Rahul Patel"));
        chrisId = chrisUser.getId();
        billId = bill.getId();
        sarahId = sarah.getId();
        rahulId = rahul.getId();
        alumniProfiles.save(new AlumniProfile(sarah, "Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY"));
        alumniProfiles.save(new AlumniProfile(rahul, "SSE · Computer Science", 2023, "SWE-III · Anthropic",
                "San Francisco, CA"));
        conversations.save(new Conversation(chrisUser, sarah, "reply", "Happy to chat", OffsetDateTime.now(), true));
        appointments.save(new AdvisingAppointment(bill, chrisUser, OffsetDateTime.now().minusDays(3), "Intro"));
        appointments.save(new AdvisingAppointment(bill, chrisUser, OffsetDateTime.now().plusDays(2),
                "Interview prep, Mock ready"));
        chris = TestTokens.bearer(chrisId, "STUDENT");
        alex = TestTokens.bearer(alexUser.getId(), "STUDENT");
        advisor = TestTokens.bearer(billId, "ADVISOR");
        alum = TestTokens.bearer(sarahId, "ALUMNI");
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    private static String application(String company, String status, String appliedOn) {
        return "{\"company\":\"" + company + "\",\"roleTitle\":\"Summer Analyst\",\"status\":\"" + status
                + "\",\"appliedOn\":\"" + appliedOn + "\",\"notes\":\"Superday Friday\"}";
    }

    private long create(String token, String body) throws Exception {
        String json = mvc.perform(post("/me/applications").header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(json, "$.id")).longValue();
    }

    @Test
    void theSummaryCountsThreadsUpcomingSessionsAndApplications() throws Exception {
        // Arrange
        create(chris, application("Moelis", "applied", TODAY));

        // Act and Assert
        mvc.perform(get("/me/summary").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alumni").value(1))
                .andExpect(jsonPath("$.appointments").value(1))
                .andExpect(jsonPath("$.applications").value(1));
    }

    @Test
    void appointmentsComeOldestFirstNamedByTheAdvisor() throws Exception {
        // Act and Assert
        mvc.perform(get("/me/appointments").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].withName").value("Bill Hudlow"))
                .andExpect(jsonPath("$[0].tags[0]").value("Intro"))
                .andExpect(jsonPath("$[1].tags[1]").value("Mock ready"));
    }

    @Test
    void alumniListEveryAlumWithTheStudentsThread() throws Exception {
        // Act and Assert
        mvc.perform(get("/me/alumni").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Rahul Patel"))
                .andExpect(jsonPath("$[0].initials").value("RP"))
                .andExpect(jsonPath("$[0].currentRole").value("SWE-III · Anthropic"))
                .andExpect(jsonPath("$[0].status").value(nullValue()))
                .andExpect(jsonPath("$[1].id").value(sarahId))
                .andExpect(jsonPath("$[1].gradYear").value(2016))
                .andExpect(jsonPath("$[1].status").value("reply"))
                .andExpect(jsonPath("$[1].statusLabel").value("Replied"))
                .andExpect(jsonPath("$[1].snippet").value("Happy to chat"));
    }

    @Test
    void aStudentStartsAConversationOnceOnly() throws Exception {
        // Act and Assert
        mvc.perform(post("/me/alumni/" + rahulId + "/conversations").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"  Could we talk APM?  \"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(rahulId))
                .andExpect(jsonPath("$.status").value("sent"))
                .andExpect(jsonPath("$.statusLabel").value("Sent"))
                .andExpect(jsonPath("$.snippet").value("Could we talk APM?"));
        mvc.perform(post("/me/alumni/" + rahulId + "/conversations").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"Again\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("You are already talking to Rahul Patel."));
        mvc.perform(get("/me/summary").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(jsonPath("$.alumni").value(2));
    }

    @Test
    void aConversationNeedsAMessageAndARealAlum() throws Exception {
        // Act and Assert
        mvc.perform(post("/me/alumni/" + rahulId + "/conversations").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Write a message of 1 to 500 characters."));
        mvc.perform(post("/me/alumni/" + billId + "/conversations").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"Hello\"}"))
                .andExpect(status().isNotFound());
        mvc.perform(post("/me/alumni/999999/conversations").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"Hello\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Alum not found."));
    }

    @Test
    void anApplicationIsCreatedEditedAndDeleted() throws Exception {
        // Arrange
        long id = create(chris, application("Evercore", "applied", TODAY));

        // Act and Assert: the row is stored and listed
        JobApplication stored = applications.findById(id).orElseThrow();
        assertEquals("Evercore", stored.getCompany());
        mvc.perform(get("/me/applications").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].roleTitle").value("Summer Analyst"))
                .andExpect(jsonPath("$[0].appliedOn").value(TODAY))
                .andExpect(jsonPath("$[0].notes").value("Superday Friday"));

        // Act and Assert: an edit replaces the row
        mvc.perform(put("/me/applications/" + id).header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content(application("Evercore", "offer", TODAY)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.status").value("offer"));
        assertEquals("offer", applications.findById(id).orElseThrow().getStatus());
        assertEquals(1, applications.count());

        // Act and Assert: deleting removes it
        mvc.perform(delete("/me/applications/" + id).header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(status().isNoContent());
        assertTrue(applications.findById(id).isEmpty());
        mvc.perform(get("/me/applications").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void applicationsComeMostRecentlyAppliedFirst() throws Exception {
        // Arrange
        String earlier = LocalDate.parse(TODAY).minusDays(10).toString();
        create(chris, application("Lazard", "rejected", earlier));
        create(chris, application("Moelis", "applied", TODAY));

        // Act and Assert
        mvc.perform(get("/me/applications").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(jsonPath("$[0].company").value("Moelis"))
                .andExpect(jsonPath("$[1].company").value("Lazard"));
    }

    @Test
    void anInvalidApplicationIsRefused() throws Exception {
        // Arrange
        String tomorrow = LocalDate.parse(TODAY).plusDays(1).toString();

        // Act and Assert
        mvc.perform(post("/me/applications").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content(application("Moelis", "applied", tomorrow)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("The date you applied cannot be in the future."));
        mvc.perform(post("/me/applications").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content(application("Moelis", "ghosted", TODAY)))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/me/applications").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content(application(" ", "applied", TODAY)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Company is required."));
        mvc.perform(post("/me/applications").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content(application("Moelis", "applied", "not a date")))
                .andExpect(status().isBadRequest());
        assertEquals(0, applications.count());
    }

    @Test
    void anotherStudentsApplicationLooksMissing() throws Exception {
        // Arrange
        long alexs = create(alex, application("Stripe", "interview", TODAY));

        // Act and Assert
        mvc.perform(put("/me/applications/" + alexs).header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content(application("Stripe", "offer", TODAY)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Application not found."));
        mvc.perform(delete("/me/applications/" + alexs).header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/me/applications/999999").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(status().isNotFound());
        mvc.perform(get("/me/applications").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(jsonPath("$", hasSize(0)));
        assertEquals("interview", applications.findById(alexs).orElseThrow().getStatus());
    }

    @Test
    void aResumeIsBlankThenSavedThenReplaced() throws Exception {
        // Act and Assert: blank before the first save
        mvc.perform(get("/me/resume").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headline").value(""))
                .andExpect(jsonPath("$.skills").value(""))
                .andExpect(jsonPath("$.updatedAt").value(nullValue()));

        // Act and Assert: saved, then saved again over the same row
        mvc.perform(put("/me/resume").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"headline\":\"Finance + CS\",\"summary\":\"Junior\",\"experience\":\"\",\"skills\":\"Excel\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headline").value("Finance + CS"));
        mvc.perform(put("/me/resume").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"headline\":\"Finance + CS, Class of '27\",\"summary\":\"\",\"experience\":\"Fund\",\"skills\":\"Python\"}"))
                .andExpect(status().isOk());
        assertEquals(1, resumes.count());
        mvc.perform(get("/me/resume").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(jsonPath("$.headline").value("Finance + CS, Class of '27"))
                .andExpect(jsonPath("$.experience").value("Fund"))
                .andExpect(jsonPath("$.skills").value("Python"))
                .andExpect(jsonPath("$.updatedAt").isNotEmpty());
    }

    @Test
    void aResumeNeedsAHeadline() throws Exception {
        // Act and Assert
        mvc.perform(put("/me/resume").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"headline\":\"  \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("A headline is required."));
    }

    @Test
    void theAdvisorSeesTheStudentsApplicationsAndResume() throws Exception {
        // Arrange
        create(chris, application("Evercore", "interview", TODAY));
        mvc.perform(put("/me/resume").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"headline\":\"Finance + CS\"}"))
                .andExpect(status().isOk());

        // Act and Assert
        mvc.perform(get("/advisor/students/" + chrisId).header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applications", hasSize(1)))
                .andExpect(jsonPath("$.applications[0].company").value("Evercore"))
                .andExpect(jsonPath("$.resume.headline").value("Finance + CS"));
        mvc.perform(get("/advisor/students/" + chrisId).header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(jsonPath("$.resume.summary").value(""));
    }

    @Test
    void anAdvisorOrAlumIsRefusedTheStudentTabs() throws Exception {
        // Act and Assert
        mvc.perform(get("/me/summary").header(HttpHeaders.AUTHORIZATION, advisor)).andExpect(status().isForbidden());
        mvc.perform(get("/me/applications").header(HttpHeaders.AUTHORIZATION, advisor)).andExpect(status().isForbidden());
        mvc.perform(post("/me/applications").header(HttpHeaders.AUTHORIZATION, advisor)
                        .contentType(MediaType.APPLICATION_JSON).content(application("Moelis", "applied", TODAY)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/me/resume").header(HttpHeaders.AUTHORIZATION, alum)).andExpect(status().isForbidden());
        mvc.perform(get("/me/alumni").header(HttpHeaders.AUTHORIZATION, alum)).andExpect(status().isForbidden());
        assertEquals(0, applications.count());
    }

    @Test
    void withoutATokenTheStudentTabsAskForSignIn() throws Exception {
        // Act and Assert
        mvc.perform(get("/me/summary")).andExpect(status().isUnauthorized());
        mvc.perform(get("/me/appointments")).andExpect(status().isUnauthorized());
        mvc.perform(get("/me/applications")).andExpect(status().isUnauthorized());
        mvc.perform(get("/me/resume")).andExpect(status().isUnauthorized());
    }
}
