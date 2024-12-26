-- migrate:up

CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INT NOT NULL DEFAULT date_part('year', CURRENT_DATE),
    semester INT,
    slug TEXT NOT NULL,
    UNIQUE NULLS NOT DISTINCT (year, semester, slug),
    title TEXT NOT NULL,
    description TEXT DEFAULT '' NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE course_teachers (
    user_id UUID REFERENCES users(id) NOT NULL,
    course_id UUID REFERENCES courses(id) NOT NULL,
    PRIMARY KEY (user_id, course_id),
    slug TEXT
);

CREATE TABLE course_students (
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) NOT NULL,
    slug TEXT NOT NULL,
    UNIQUE (course_id, slug),
    parent_id UUID REFERENCES lessons(id),
    position INTEGER NOT NULL,
    UNIQUE NULLS NOT DISTINCT (parent_id, position),
    icon TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL
);

CREATE TABLE homeworks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES lessons(id) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_solution_multiline BOOLEAN NOT NULL,
    solution_syntax_highlighting TEXT DEFAULT NULL
);

CREATE TABLE homework_submissions (
    student_id UUID REFERENCES users(id) NOT NULL,
    homework_id UUID REFERENCES homeworks(id) NOT NULL,
    attempt INTEGER NOT NULL,
    PRIMARY KEY (student_id, homework_id, attempt),
    solution TEXT NOT NULL,
    comment TEXT DEFAULT '' NOT NULL,
    feedback TEXT DEFAULT '' NOT NULL,
    accepted BOOLEAN DEFAULT NULL,
    reviewer_id UUID REFERENCES users(id),
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN homework_submissions.solution IS 'Homework solution, usually in form of text or of an URL';
COMMENT ON COLUMN homework_submissions.comment IS 'Student comment';
COMMENT ON COLUMN homework_submissions.feedback IS 'Feedback from reviewer';
COMMENT ON COLUMN homework_submissions.accepted IS 'Whether homework is accepted or rejected by teacher. If set to NULL, it is not reviewed yet.';

-- migrate:down

DROP TABLE IF EXISTS homework_submissions;
DROP TABLE IF EXISTS homeworks;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS course_students;
DROP TABLE IF EXISTS course_teachers;
DROP TABLE IF EXISTS courses;
