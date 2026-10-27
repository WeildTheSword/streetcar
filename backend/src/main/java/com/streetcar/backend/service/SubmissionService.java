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
                .orElseThrow(() -> notFound(id));
    }

    public Submission create(Submission input) {
        Submission clean = input.normalized();
        var key = new GeneratedKeyHolder();
        jdbc.sql("INSERT INTO submissions (gpa, completed_courses, major, career_goal) VALUES (?, ?, ?, ?)")
                .params(clean.gpa(), clean.completedCourses(), clean.major(), clean.careerGoal())
                .update(key, "id");
        return getById(key.getKey().longValue());
    }

    public Submission update(long id, Submission input) {
        Submission clean = input.normalized();
        int rows = jdbc.sql("UPDATE submissions SET gpa = ?, completed_courses = ?, major = ?, career_goal = ? WHERE id = ?")
                .params(clean.gpa(), clean.completedCourses(), clean.major(), clean.careerGoal(), id)
                .update();
        if (rows == 0) {
            throw notFound(id);
        }
        return getById(id);
    }

    public void delete(long id) {
        int rows = jdbc.sql("DELETE FROM submissions WHERE id = ?").param(id).update();
        if (rows == 0) {
            throw notFound(id);
        }
    }

    private static NoSuchElementException notFound(long id) {
        return new NoSuchElementException("Submission " + id + " not found");
    }
}
