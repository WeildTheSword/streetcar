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
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** The advisor's student lookup, through the real User-to-Submission mapping and schema.sql. */
@SpringBootTest
class StudentDirectoryApiTest {
    private static final String BODY =
            "{\"gpa\":3.5,\"completedCourses\":\"CMPS 1500\",\"major\":\"Finance\",\"careerGoal\":\"Analyst\"}";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private SubmissionRepository submissions;

    @Autowired
    private UserRepository users;

    private MockMvc mvc;
    private long chrisId;
    private String chris;
    private String advisor;
    private long advisorId;

    @BeforeEach
    void seedTwoStudentsAndAnAdvisor() {
        submissions.deleteAll();
        users.deleteAll();
        User chrisAccount = users.save(new User("chris@tulane.edu", "not-a-real-hash", "STUDENT", "Chris Boudreaux"));
        chrisId = chrisAccount.getId();
        chris = TestTokens.bearer(chrisId, "STUDENT");
        users.save(new User("alex@tulane.edu", "not-a-real-hash", "STUDENT", "Alex Rivera"));
        advisorId = users.save(new User("bill@tulane.edu", "not-a-real-hash", "ADVISOR", "Bill Hudlow")).getId();
        advisor = TestTokens.bearer(advisorId, "ADVISOR");
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    private void submitAsChris() throws Exception {
        mvc.perform(post("/submissions").header(HttpHeaders.AUTHORIZATION, chris)
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isCreated());
    }

    @Test
    void anAdvisorSeesEveryStudentAccountButNoAdvisors() throws Exception {
        // Arrange
        submitAsChris();

        // Act and Assert
        mvc.perform(get("/advisor/students").header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Alex Rivera"))
                .andExpect(jsonPath("$[0].submissionCount").value(0))
                .andExpect(jsonPath("$[1].name").value("Chris Boudreaux"))
                .andExpect(jsonPath("$[1].email").value("chris@tulane.edu"))
                .andExpect(jsonPath("$[1].submissionCount").value(1));
    }

    @Test
    void anAdvisorOpensAStudentAndSeesTheirSubmissions() throws Exception {
        // Arrange
        submitAsChris();

        // Act and Assert
        mvc.perform(get("/advisor/students/" + chrisId).header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Chris Boudreaux"))
                .andExpect(jsonPath("$.submissions", hasSize(1)))
                .andExpect(jsonPath("$.submissions[0].major").value("Finance"));
    }

    @Test
    void anAdvisorAccountIsNotAStudentToLookUp() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/students/" + advisorId).header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isNotFound());
    }

    @Test
    void aStudentIsRefusedTheDirectory() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/students").header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(status().isForbidden());
        mvc.perform(get("/advisor/students/" + chrisId).header(HttpHeaders.AUTHORIZATION, chris))
                .andExpect(status().isForbidden());
    }

    @Test
    void withoutATokenTheDirectoryAsksForSignIn() throws Exception {
        // Act and Assert
        mvc.perform(get("/advisor/students")).andExpect(status().isUnauthorized());
    }

    @Test
    void submissionsComeBackNewestFirst() throws Exception {
        // Arrange
        submitAsChris();
        submitAsChris();

        // Act
        String json = mvc.perform(get("/advisor/students/" + chrisId).header(HttpHeaders.AUTHORIZATION, advisor))
                .andReturn().getResponse().getContentAsString();

        // Assert: newest first, as the @OrderBy on User.submissions says
        long first = ((Number) JsonPath.read(json, "$.submissions[0].id")).longValue();
        long second = ((Number) JsonPath.read(json, "$.submissions[1].id")).longValue();
        assertTrue(first > second);
    }
}
