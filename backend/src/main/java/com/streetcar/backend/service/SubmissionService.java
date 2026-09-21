package com.streetcar.backend.service;

import com.streetcar.backend.model.Submission;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;

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

    public Submission getById(long id) {
        return jdbc.sql("SELECT * FROM submissions WHERE id = ?")
                .param(id).query(Submission.class).optional()
                .orElseThrow(() -> new NoSuchElementException("Submission " + id + " not found"));
    }

    public Submission create(Submission input) {
        var key = new GeneratedKeyHolder();
        jdbc.sql("INSERT INTO submissions (gpa, completed_courses, major, career_goal) VALUES (?, ?, ?, ?)")
                .params(input.gpa(), input.completedCourses().strip(),
                        input.major().strip(), input.careerGoal().strip())
                .update(key, "id");
        return getById(key.getKey().longValue());
    }

    public Submission update(long id, Submission input) {
        int rows = jdbc.sql("UPDATE submissions SET gpa = ?, completed_courses = ?, major = ?, career_goal = ? WHERE id = ?")
                .params(input.gpa(), input.completedCourses().strip(),
                        input.major().strip(), input.careerGoal().strip(), id)
                .update();
        if (rows == 0) {
            throw new NoSuchElementException("Submission " + id + " not found");
        }
        return getById(id);
    }

    public void delete(long id) {
        int rows = jdbc.sql("DELETE FROM submissions WHERE id = ?").param(id).update();
        if (rows == 0) {
            throw new NoSuchElementException("Submission " + id + " not found");
        }
    }
}
