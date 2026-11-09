CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    gpa NUMERIC(3,2) NOT NULL CHECK (gpa BETWEEN 0 AND 4),
    completed_courses VARCHAR(2000) NOT NULL CHECK (TRIM(completed_courses) <> ''),
    major VARCHAR(120) NOT NULL CHECK (TRIM(major) <> ''),
    career_goal VARCHAR(200) NOT NULL CHECK (TRIM(career_goal) <> ''),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL
);

-- The demo catalogue. Each row is inserted only if missing, so a restart keeps
-- what is already there. This form runs on both H2 and PostgreSQL.
INSERT INTO courses (id, code, title, description)
SELECT 1, 'CMPS 1500', 'Introduction to Computer Science',
    'Foundational programming concepts. Recommended for students pursuing software engineering.'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 1);
INSERT INTO courses (id, code, title, description)
SELECT 2, 'CMPS 2200', 'Data Structures and Algorithms',
    'Core data structures and algorithmic analysis. Frequently required for technical interviews.'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 2);
INSERT INTO courses (id, code, title, description)
SELECT 3, 'BSAN 3010', 'Business Analytics',
    'Data-driven decision making. Suits students exploring analytics career paths.'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 3);
