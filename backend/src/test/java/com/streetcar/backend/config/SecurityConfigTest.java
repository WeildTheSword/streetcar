package com.streetcar.backend.config;

import com.jayway.jsonpath.JsonPath;
import com.streetcar.backend.TestTokens;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.SubmissionRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {
    private static final String ORIGIN = "http://localhost:5173";
    @Autowired
    private MockMvc mvc;

    @Autowired
    private SubmissionRepository submissions;

    @Autowired
    private UserRepository users;

    private String student;
    private String advisor;

    @BeforeEach
    void createOneUserOfEachRole() {
        submissions.deleteAll();
        users.deleteAll();
        student = TestTokens.bearer(users.save(new User("student@example.com", "not-a-real-hash", "STUDENT", "Test Student")).getId(), "STUDENT");
        advisor = TestTokens.bearer(users.save(new User("advisor@example.com", "not-a-real-hash", "ADVISOR", "Test Advisor")).getId(), "ADVISOR");
    }

    private long createSubmission() throws Exception {
        String json = mvc.perform(post("/submissions")
                        .header(HttpHeaders.AUTHORIZATION, student)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"gpa\":3,\"completedCourses\":\"A\",\"major\":\"B\",\"careerGoal\":\"C\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(json, "$.id")).longValue();
    }

    @Test
    void noTokenOnAProtectedEndpointAnswers401WithAMessage() throws Exception {
        // Arrange: no Authorization header

        // Act + Assert
        mvc.perform(get("/submissions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void anInvalidTokenOnAProtectedEndpointAnswers401() throws Exception {
        // Arrange
        String invalid = "Bearer not-a-real-token";

        // Act + Assert
        mvc.perform(get("/courses").header(HttpHeaders.AUTHORIZATION, invalid))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void theOldDemoEndpointsNeedATokenToo() throws Exception {
        // Arrange: no Authorization header

        // Act + Assert
        mvc.perform(get("/students/morgan-thibodaux")).andExpect(status().isUnauthorized());
        mvc.perform(get("/advisors/bill-hudlow/dashboard")).andExpect(status().isUnauthorized());
    }

    @Test
    void aValidTokenReachesAProtectedEndpoint() throws Exception {
        // Arrange: a student token

        // Act + Assert
        mvc.perform(get("/courses").header(HttpHeaders.AUTHORIZATION, student))
                .andExpect(status().isOk());
    }

    @Test
    void authEndpointsStayOpenEvenWithAStaleToken() throws Exception {
        // Arrange
        String body = "{\"email\":\"nobody@example.com\",\"password\":\"wrong\"}";

        // Act + Assert: 401 from the login check itself would still prove the request got through,
        // so look for the controller's empty body rather than the security message.
        mvc.perform(post("/auth/login").header(HttpHeaders.AUTHORIZATION, "Bearer stale")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").doesNotExist());
        mvc.perform(post("/auth/reset")).andExpect(status().isNoContent());
    }

    @Test
    void aStudentCannotDeleteAndTheRecordSurvives() throws Exception {
        // Arrange
        long id = createSubmission();

        // Act
        mvc.perform(delete("/submissions/" + id).header(HttpHeaders.AUTHORIZATION, student))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").isNotEmpty());

        // Assert
        mvc.perform(get("/submissions/" + id).header(HttpHeaders.AUTHORIZATION, student))
                .andExpect(status().isOk());
    }

    @Test
    void anAdvisorCanDelete() throws Exception {
        // Arrange
        long id = createSubmission();

        // Act
        mvc.perform(delete("/submissions/" + id).header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isNoContent());

        // Assert
        mvc.perform(get("/submissions/" + id).header(HttpHeaders.AUTHORIZATION, advisor))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteWithNoTokenIs401Not403() throws Exception {
        // Arrange: no Authorization header

        // Act + Assert
        mvc.perform(delete("/submissions/1")).andExpect(status().isUnauthorized());
    }

    @Test
    void theBrowserMayPreflightARequestCarryingTheAuthorizationHeader() throws Exception {
        // Arrange: what a browser sends before a cross-origin DELETE

        // Act + Assert
        mvc.perform(options("/submissions/1")
                        .header(HttpHeaders.ORIGIN, ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "DELETE")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ORIGIN))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                        containsString("authorization")));
    }

    @Test
    void aRejectionStillCarriesCorsHeadersSoTheBrowserCanReadIt() throws Exception {
        // Arrange: no token, from the frontend's origin

        // Act + Assert
        mvc.perform(get("/submissions").header(HttpHeaders.ORIGIN, ORIGIN))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ORIGIN));
    }
}
