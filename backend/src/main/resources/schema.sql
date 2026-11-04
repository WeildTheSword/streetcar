CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    gpa NUMERIC(3,2) NOT NULL CHECK (gpa BETWEEN 0 AND 4),
    completed_courses VARCHAR(2000) NOT NULL CHECK (TRIM(completed_courses) <> ''),
    major VARCHAR(120) NOT NULL CHECK (TRIM(major) <> ''),
    career_goal VARCHAR(200) NOT NULL CHECK (TRIM(career_goal) <> ''),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    gpa NUMERIC(3,2) NOT NULL CHECK (gpa BETWEEN 0 AND 4),
    completed_courses VARCHAR(2000) NOT NULL CHECK (TRIM(completed_courses) <> ''),
    major VARCHAR(120) NOT NULL CHECK (TRIM(major) <> ''),
    career_goal VARCHAR(200) NOT NULL CHECK (TRIM(career_goal) <> ''),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A separate statement so databases created before this column get it too.
-- Nullable because those older rows have no owner to point at.
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users (id);
CREATE INDEX IF NOT EXISTS submissions_user_id_idx ON submissions (user_id);

