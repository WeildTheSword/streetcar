package com.streetcar.backend.service;

import com.streetcar.backend.model.Submission;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubmissionService {
    private final JdbcClient jdbc;

    public SubmissionService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Submission> getAll() {
        return jdbc.sql("SELECT * FROM submissions ORDER BY id DESC")
                .query(Submission.class).list();
    }

    public Submission create(Submission input) {
        var key = new GeneratedKeyHolder();
        jdbc.sql("INSERT INTO submissions (gpa, completed_courses, major, career_goal) VALUES (?, ?, ?, ?)")
                .params(input.gpa(), input.completedCourses().strip(),
                        input.major().strip(), input.careerGoal().strip())
                .update(key, "id");
        return jdbc.sql("SELECT * FROM submissions WHERE id = ?")
                .param(key.getKey().longValue()).query(Submission.class).single();
    }
}
