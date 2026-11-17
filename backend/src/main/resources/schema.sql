CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    -- A BCrypt hash. The plain-text password is never stored.
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    display_name VARCHAR(120) NOT NULL
);

-- The role check is named and replaced on every start, so databases created
-- when only STUDENT and ADVISOR existed (PostgreSQL named that check
-- users_role_check) accept ALUMNI too.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('STUDENT', 'ADVISOR', 'ALUMNI'));

CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    gpa NUMERIC(3,2) NOT NULL CHECK (gpa BETWEEN 0 AND 4),
    completed_courses VARCHAR(2000) NOT NULL CHECK (TRIM(completed_courses) <> ''),
    major VARCHAR(120) NOT NULL CHECK (TRIM(major) <> ''),
    career_goal VARCHAR(200) NOT NULL CHECK (TRIM(career_goal) <> ''),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A separate statement so databases created before this column get it too.
-- Nullable because those older rows have no owner to point at. Deleting an
-- account deletes its submissions, so the demo reset can remove sign-ups.
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users (id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS submissions_user_id_idx ON submissions (user_id);

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

-- One-to-one extensions of a users row, keyed by the same id. Deleting the
-- account deletes its profile.
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    class_year VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    school VARCHAR(120) NOT NULL,
    grad_year INT NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    city VARCHAR(120) NOT NULL
);

-- An advising session: one advisor account meets one student account.
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    advisor_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    tags VARCHAR(500) NOT NULL
);
CREATE INDEX IF NOT EXISTS appointments_advisor_idx ON appointments (advisor_id, starts_at);
CREATE INDEX IF NOT EXISTS appointments_student_idx ON appointments (student_id);

-- A thread between a student account and an alumni account.
CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    alumnus_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL CHECK (status IN ('reply', 'sent', 'draft', 'warm')),
    snippet VARCHAR(500) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    unread BOOLEAN NOT NULL
);
CREATE INDEX IF NOT EXISTS conversations_student_idx ON conversations (student_id);
CREATE INDEX IF NOT EXISTS conversations_alumnus_idx ON conversations (alumnus_id);

-- When each account was created, for the advisor's activity log. Rows that
-- predate the column take the time it was added.
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- A job or internship a student has applied to, tracked through its stages.
CREATE TABLE IF NOT EXISTS applications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    company VARCHAR(120) NOT NULL,
    role_title VARCHAR(160) NOT NULL,
    status VARCHAR(12) NOT NULL CHECK (status IN ('applied', 'interview', 'offer', 'rejected')),
    applied_on DATE NOT NULL,
    notes VARCHAR(500),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX IF NOT EXISTS applications_student_idx ON applications (student_id);

-- A student's resume: one-to-one with the account, keyed by the same id.
CREATE TABLE IF NOT EXISTS resumes (
    user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    headline VARCHAR(200) NOT NULL,
    summary VARCHAR(2000) NOT NULL,
    experience VARCHAR(4000) NOT NULL,
    skills VARCHAR(1000) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
