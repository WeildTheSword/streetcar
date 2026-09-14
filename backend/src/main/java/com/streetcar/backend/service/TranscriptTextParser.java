package com.streetcar.backend.service;

import com.streetcar.backend.model.TranscriptCourse;
import com.streetcar.backend.model.TranscriptResult;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses text already extracted from a transcript/degree-audit PDF into a TranscriptResult.
 * Kept separate from PDF extraction so the row-parsing logic can be unit tested with plain strings.
 */
public class TranscriptTextParser {

    private static final Pattern STUDENT_NAME = Pattern.compile("Student name\\s+(.+?)\\s+Student ID");
    private static final Pattern STUDENT_ID = Pattern.compile("Student ID\\s+(\\d+)");
    private static final Pattern DEGREE = Pattern.compile("Degree\\s+(.+?)\\s+Audit date");
    private static final Pattern OVERALL_GPA = Pattern.compile("Overall GPA\\s+([\\d.]+)");

    // Course rows look like: "ENGL 1010  Writing  A  4  2023 Fall" possibly with a
    // "|Req. n| ..." label before the code and a "(R)" repeated marker after the term.
    private static final Pattern COURSE_ROW = Pattern.compile(
        "([A-Z]{2,5}\\s\\d{3,4})\\s+(.+?)\\s+([A-Za-z]{1,3}[+\\-]?)\\s+(\\(?\\d+(?:\\.\\d+)?\\)?)\\s+(\\d{4}\\s+(?:Fall|Spring|Summer))(?:\\s+\\(R\\))?"
    );

    public TranscriptResult parse(String rawText) {
        String text = rawText.replaceAll("\\s+", " ").trim();

        String studentName = firstMatch(STUDENT_NAME, text);
        String studentId = firstMatch(STUDENT_ID, text);
        String degree = firstMatch(DEGREE, text);
        String gpaText = firstMatch(OVERALL_GPA, text);
        Double overallGpa = gpaText == null ? null : Double.valueOf(gpaText);

        Map<String, TranscriptCourse> courses = new LinkedHashMap<>();
        Matcher matcher = COURSE_ROW.matcher(text);
        while (matcher.find()) {
            String code = matcher.group(1).trim();
            String title = matcher.group(2).trim();
            String grade = matcher.group(3);
            double credits = Double.parseDouble(matcher.group(4).replaceAll("[()]", ""));
            String term = matcher.group(5).trim();
            boolean inProgress = "IP".equals(grade);

            String key = code + "|" + term;
            courses.putIfAbsent(key, new TranscriptCourse(code, title, grade, credits, term, inProgress));
        }

        return new TranscriptResult(studentName, studentId, degree, overallGpa, new ArrayList<>(courses.values()));
    }

    private String firstMatch(Pattern pattern, String text) {
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group(1).trim() : null;
    }
}
