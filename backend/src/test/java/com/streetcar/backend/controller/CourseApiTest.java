package com.streetcar.backend.controller;

import com.streetcar.backend.TestTokens;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** GET /courses through the real entity mapping and the rows schema.sql seeds. */
@SpringBootTest
@AutoConfigureMockMvc
class CourseApiTest {

    /** The response GET /courses gave when the catalogue was held in memory. */
    private static final String CATALOGUE_BEFORE_THE_DATABASE = """
            [{"id":1,"code":"CMPS 1500","title":"Introduction to Computer Science",\
            "description":"Foundational programming concepts. Recommended for students pursuing software engineering."},\
            {"id":2,"code":"CMPS 2200","title":"Data Structures and Algorithms",\
            "description":"Core data structures and algorithmic analysis. Frequently required for technical interviews."},\
            {"id":3,"code":"BSAN 3010","title":"Business Analytics",\
            "description":"Data-driven decision making. Suits students exploring analytics career paths."}]""";

    @Autowired
    private MockMvc mvc;

    @Test
    void getCoursesReturnsTheSameCatalogueAsBeforeReadFromTheDatabase() throws Exception {
        // Arrange: schema.sql seeded the courses table at startup, and every route outside /auth needs a token
        String student = TestTokens.bearer(1L, "STUDENT");

        // Act + Assert
        mvc.perform(get("/courses").header(HttpHeaders.AUTHORIZATION, student))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(content().json(CATALOGUE_BEFORE_THE_DATABASE, JsonCompareMode.STRICT));
    }
}
