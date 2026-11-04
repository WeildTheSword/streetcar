package com.streetcar.backend.controller;

import com.jayway.jsonpath.JsonPath;
import com.streetcar.backend.repository.SubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

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
@AutoConfigureMockMvc
class SubmissionApiTest {
    private static final String BODY =
            "{\"gpa\":3.5,\"completedCourses\":\" CMPS 1500 \",\"major\":\" CS \",\"careerGoal\":\" SWE \"}";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private SubmissionRepository repository;

    @BeforeEach
    void emptyTheTable() {
        repository.deleteAll();
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
        // Arrange: empty table from emptyTheTable

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
    void deleteRemovesTheRecord() throws Exception {
        // Arrange
        long id = createOne();

        // Act
        mvc.perform(delete("/submissions/" + id)).andExpect(status().isNoContent());

        // Assert
        mvc.perform(get("/submissions/" + id)).andExpect(status().isNotFound());
    }
}
