package com.streetcar.backend.controller;

import com.jayway.jsonpath.JsonPath;
import com.streetcar.backend.TestTokens;
import com.streetcar.backend.model.User;
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

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** The real entity mapping against the real schema.sql, which the mocked service tests can't reach. */
@SpringBootTest
class SubmissionApiTest {
    private static final String BODY =
            "{\"gpa\":3.5,\"completedCourses\":\" CMPS 1500 \",\"major\":\" CS \",\"careerGoal\":\" SWE \"}";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private SubmissionRepository repository;

    @Autowired
    private UserRepository users;

    private MockMvc mvc;
    private String alex;
    private String jordan;

    @BeforeEach
    void emptyTheTableAndSignInAsAnAdvisor() {
        repository.deleteAll();
        users.deleteAll();
        alex = bearerFor("alex@example.com", "STUDENT");
        jordan = bearerFor("jordan@example.com", "STUDENT");
        String advisor = bearerFor("sarah@example.com", "ADVISOR");
        // Requests run as the advisor unless a test says otherwise.
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .defaultRequest(get("/").header(HttpHeaders.AUTHORIZATION, advisor))
                .build();
    }

    private String bearerFor(String email, String role) {
        return TestTokens.bearer(users.save(new User(email, "not-a-real-hash", role, "Test User")).getId(), role);
    }

    private long createAs(String bearer) throws Exception {
        String json = mvc.perform(post("/submissions").header(HttpHeaders.AUTHORIZATION, bearer)
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(json, "$.id")).longValue();
    }

    private String read(long id) throws Exception {
        return mvc.perform(get("/submissions/" + id)).andReturn().getResponse().getContentAsString();
    }

    private long createOne() throws Exception {
        String json = mvc.perform(post("/submissions").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(json, "$.id")).longValue();
    }

    @Test
    void createReturnsExactlyWhatALaterReadReturns() throws Exception {
        // Arrange: empty table from setup

        // Act
        String created = mvc.perform(post("/submissions").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.gpa").value(3.5))
                .andExpect(jsonPath("$.completedCourses").value("CMPS 1500"))
                .andExpect(jsonPath("$.major").value("CS"))
                .andExpect(jsonPath("$.careerGoal").value("SWE"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        // Assert
        long id = ((Number) JsonPath.read(created, "$.id")).longValue();
        assertEquals(created, read(id));
    }

    @Test
    void anIdInTheCreateBodyCannotOverwriteAnExistingRecord() throws Exception {
        // Arrange
        long existing = createOne();
        String body = "{\"id\":" + existing + ",\"gpa\":1,\"completedCourses\":\"A\",\"major\":\"B\",\"careerGoal\":\"C\"}";

        // Act
        mvc.perform(post("/submissions").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        // Assert
        mvc.perform(get("/submissions")).andExpect(jsonPath("$", hasSize(2)));
        mvc.perform(get("/submissions/" + existing)).andExpect(jsonPath("$.major").value("CS"));
    }

    @Test
    void updateKeepsCreatedAtAndALaterReadSeesTheChange() throws Exception {
        // Arrange
        long id = createOne();
        String createdAt = JsonPath.read(read(id), "$.createdAt");
        String changes = "{\"gpa\":3.25,\"completedCourses\":\"X\",\"major\":\"Y\",\"careerGoal\":\"Z\"}";

        // Act
        mvc.perform(put("/submissions/" + id).contentType(MediaType.APPLICATION_JSON).content(changes))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.createdAt").value(createdAt));

        // Assert
        mvc.perform(get("/submissions/" + id))
                .andExpect(jsonPath("$.major").value("Y"))
                .andExpect(jsonPath("$.createdAt").value(createdAt));
    }

    @Test
    void listIsNewestFirst() throws Exception {
        // Arrange
        long first = createOne();
        long second = createOne();

        // Act + Assert
        mvc.perform(get("/submissions"))
                .andExpect(jsonPath("$[0].id").value(second))
                .andExpect(jsonPath("$[1].id").value(first));
    }

    @Test
    void missingIdsAnswer404() throws Exception {
        // Arrange
        String changes = "{\"gpa\":3,\"completedCourses\":\"X\",\"major\":\"Y\",\"careerGoal\":\"Z\"}";

        // Act + Assert
        mvc.perform(get("/submissions/999999")).andExpect(status().isNotFound());
        mvc.perform(put("/submissions/999999").contentType(MediaType.APPLICATION_JSON).content(changes))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/submissions/999999")).andExpect(status().isNotFound());
    }

    @Test
    void twoStudentsEachSeeOnlyTheirOwnAndTheAdvisorSeesBoth() throws Exception {
        // Arrange
        long alexs = createAs(alex);
        long jordans = createAs(jordan);

        // Act + Assert
        mvc.perform(get("/submissions").header(HttpHeaders.AUTHORIZATION, alex))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(alexs));
        mvc.perform(get("/submissions").header(HttpHeaders.AUTHORIZATION, jordan))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(jordans));
        mvc.perform(get("/submissions")).andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void aStudentCannotReadOrEditAnotherStudentsRecordById() throws Exception {
        // Arrange
        long alexs = createAs(alex);
        String changes = "{\"gpa\":1,\"completedCourses\":\"X\",\"major\":\"Y\",\"careerGoal\":\"Z\"}";

        // Act + Assert
        mvc.perform(get("/submissions/" + alexs).header(HttpHeaders.AUTHORIZATION, jordan))
                .andExpect(status().isNotFound());
        mvc.perform(put("/submissions/" + alexs).header(HttpHeaders.AUTHORIZATION, jordan)
                        .contentType(MediaType.APPLICATION_JSON).content(changes))
                .andExpect(status().isNotFound());
        mvc.perform(get("/submissions/" + alexs).header(HttpHeaders.AUTHORIZATION, alex))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.major").value("CS"));
    }

    @Test
    void aStudentCanReadAndEditTheirOwnRecordById() throws Exception {
        // Arrange
        long alexs = createAs(alex);
        String changes = "{\"gpa\":1,\"completedCourses\":\"X\",\"major\":\"Y\",\"careerGoal\":\"Z\"}";

        // Act
        mvc.perform(put("/submissions/" + alexs).header(HttpHeaders.AUTHORIZATION, alex)
                        .contentType(MediaType.APPLICATION_JSON).content(changes))
                .andExpect(status().isOk());

        // Assert: still Alex's after the edit
        mvc.perform(get("/submissions").header(HttpHeaders.AUTHORIZATION, alex))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].major").value("Y"));
    }

    @Test
    void theOwnerIsNeverSentToTheBrowser() throws Exception {
        // Arrange
        long alexs = createAs(alex);

        // Act + Assert
        mvc.perform(get("/submissions/" + alexs))
                .andExpect(jsonPath("$.user").doesNotExist())
                .andExpect(jsonPath("$.userId").doesNotExist());
    }

    @Test
    void deleteRemovesTheRecord() throws Exception {
        // Arrange
        long id = createOne();

        // Act
        mvc.perform(delete("/submissions/" + id)).andExpect(status().isNoContent());

        // Assert
        mvc.perform(get("/submissions/" + id)).andExpect(status().isNotFound());
    }
}
