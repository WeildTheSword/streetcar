package com.streetcar.backend.controller;

import com.jayway.jsonpath.JsonPath;
import com.streetcar.backend.TestTokens;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.Conversation;
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
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.OffsetDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** The appointments board and alumni database, through the real mappings and schema.sql. */
@SpringBootTest
class AdvisorWorkspaceApiTest {
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
    private long advisorId;
    private String advisor;
    private String otherAdvisor;
    private String student;

    @BeforeEach
    void seedAnAdvisorAStudentAndAnAlum() {
        conversations.deleteAll();
        appointments.deleteAll();
        alumniProfiles.deleteAll();
        studentProfiles.deleteAll();
        submissions.deleteAll();
        users.deleteAll();
        User chris = users.save(new User("chris@tulane.edu", "not-a-real-hash", "STUDENT", "Chris Boudreaux"));
        chrisId = chris.getId();
        student = TestTokens.bearer(chrisId, "STUDENT");
        advisorId = users.save(new User("bill@tulane.edu", "not-a-real-hash", "ADVISOR", "Bill Hudlow")).getId();
        advisor = TestTokens.bearer(advisorId, "ADVISOR");
        long otherId = users.save(new User("kim@tulane.edu", "not-a-real-hash", "ADVISOR", "Kim Lee")).getId();
        otherAdvisor = TestTokens.bearer(otherId, "ADVISOR");
        User sarah = users.save(new User("sarah@alumni.tulane.edu", "not-a-real-hash", "ALUMNI", "Sarah Kim"));
        alumniProfiles.save(new AlumniProfile(sarah, "Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY"));
        conversations.save(new Conversation(chris, sarah, "reply", "Happy to chat", OffsetDateTime.now(), true));
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    private String book(String body) throws Exception {
        return mvc.perform(post("/advisor/appointments").header(HttpHeaders.AUTHORIZATION, advisor)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
    }

    private String bookingFor(long studentId) {
        return "{\"studentId\":" + studentId + ",\"startsAt\":\"2026-11-18T15:30:00Z\","
                + "\"tags\":\"First session, Needs fingerprint\"}";
    }

    @Test
    void anAdvisorBooksAnAppointmentAndSeesItOnTheBoard() throws Exception {
        // Act
        String json = book(bookingFor(chrisId));

        // Assert
        org.junit.jupiter.api.Assertions.assertEquals("Chris Boudreaux", JsonPath.read(json, "$.studentName"));
        mvc.perform(get("/advisor/appointments").header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].studentId").value(chrisId))
                .andExpect(jsonPath("$[0].initials").value("CB"))
                .andExpect(jsonPath("$[0].tags[1]").value("Needs fingerprint"));
    }

    @Test
    void bookingWithoutAStartTimeIsRefused() throws Exception {
        // Act and Assert
        mvc.perform(post("/advisor/appointments").header(HttpHeaders.AUTHORIZATION, advisor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"studentId\":" + chrisId + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("A student and a start time are required."));
    }

    @Test
    void bookingANonStudentIsRefused() throws Exception {
        // Act and Assert
        mvc.perform(post("/advisor/appointments").header(HttpHeaders.AUTHORIZATION, advisor)
                        .contentType(MediaType.APPLICATION_JSON).content(bookingFor(advisorId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("That student does not exist."));
    }

    @Test
    void anUnreadableBookingIsRefused() throws Exception {
        // Act and Assert
        mvc.perform(post("/advisor/appointments").header(HttpHeaders.AUTHORIZATION, advisor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"startsAt\":\"not a time\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void anAdvisorCancelsTheirOwnAppointment() throws Exception {
        // Arrange
        long id = ((Number) JsonPath.read(book(bookingFor(chrisId)), "$.id")).longValue();

        // Act and Assert
        mvc.perform(delete("/advisor/appointments/" + id).header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isNoContent());
        mvc.perform(get("/advisor/appointments").header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(delete("/advisor/appointments/" + id).header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isNotFound());
    }

    @Test
    void anotherAdvisorCannotCancelIt() throws Exception {
        // Arrange
        long id = ((Number) JsonPath.read(book(bookingFor(chrisId)), "$.id")).longValue();

        // Act and Assert
        mvc.perform(delete("/advisor/appointments/" + id).header(HttpHeaders.AUTHORIZATION, otherAdvisor))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Appointment not found."));
    }

    @Test
    void theAlumniDatabaseListsAlumniWithTheirStudentCount() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/alumni").header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Sarah Kim"))
                .andExpect(jsonPath("$[0].currentRole").value("Goldman Sachs IBD"))
                .andExpect(jsonPath("$[0].gradYear").value(2016))
                .andExpect(jsonPath("$[0].studentCount").value(1));
    }

    @Test
    void aStudentIsRefusedTheBoardAndTheAlumniDatabase() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/appointments").header(HttpHeaders.AUTHORIZATION, student))
                .andExpect(status().isForbidden());
        mvc.perform(get("/advisor/alumni").header(HttpHeaders.AUTHORIZATION, student))
                .andExpect(status().isForbidden());
        mvc.perform(post("/advisor/appointments").header(HttpHeaders.AUTHORIZATION, student)
                        .contentType(MediaType.APPLICATION_JSON).content(bookingFor(chrisId)))
                .andExpect(status().isForbidden());
    }

    @Test
    void withoutATokenTheBoardAsksForSignIn() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/appointments")).andExpect(status().isUnauthorized());
        mvc.perform(get("/advisor/alumni")).andExpect(status().isUnauthorized());
    }
}
