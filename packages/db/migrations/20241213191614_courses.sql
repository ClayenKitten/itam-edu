-- migrate:up

CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INT NOT NULL DEFAULT date_part('year', CURRENT_DATE),
    semester INT,
    slug TEXT NOT NULL,
    UNIQUE NULLS NOT DISTINCT (year, semester, slug),
    title TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    public BOOLEAN NOT NULL DEFAULT false,
    enrollment_open BOOLEAN NOT NULL DEFAULT false,
    archived BOOLEAN NOT NULL DEFAULT false,
    blog_enabled BOOLEAN NOT NULL DEFAULT false,
    feedback_enabled BOOLEAN NOT NULL DEFAULT false
);
COMMENT ON COLUMN courses.year IS 'Year in which the course takes place';
COMMENT ON COLUMN courses.semester IS 'Optional semester in which the course takes place';
COMMENT ON COLUMN courses.slug IS 'Machine-readable name of the course that is unique in combination with year and semester';
COMMENT ON COLUMN courses.title IS 'Human-readable name of the course';
COMMENT ON COLUMN courses.description IS 'Multi-line description of the course';
COMMENT ON COLUMN courses.logo IS 'URL of the course logo';

CREATE TABLE course_staff (
    user_id UUID REFERENCES users(id) NOT NULL,
    course_id UUID REFERENCES courses(id) NOT NULL,
    PRIMARY KEY (user_id, course_id),
    title TEXT,
    admin BOOLEAN NOT NULL DEFAULT false,
    can_edit_info BOOLEAN NOT NULL DEFAULT false,
    can_edit_content BOOLEAN NOT NULL DEFAULT false,
    can_grade_homeworks BOOLEAN NOT NULL DEFAULT false,
    can_manage_blog BOOLEAN NOT NULL DEFAULT false,
    can_manage_feedback BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE course_students (
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE lessons (
    course_id UUID REFERENCES courses(id) NOT NULL,
    slug TEXT NOT NULL,
    PRIMARY KEY (course_id, slug),
    position INTEGER NOT NULL,
    UNIQUE (course_id, position) DEFERRABLE,
    title TEXT NOT NULL,
    content TEXT,
    icon TEXT
);
COMMENT ON COLUMN lessons.slug IS 'Machine-readable name of the lesson that is unique within a course';
COMMENT ON COLUMN lessons.title IS 'Human-readable name of the lesson';
COMMENT ON COLUMN lessons.content IS 'HTML content of the lesson';
COMMENT ON COLUMN lessons.icon IS 'URL of the lesson icon';

CREATE TABLE homeworks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL,
    lesson TEXT NOT NULL,
    FOREIGN KEY(course_id, lesson) REFERENCES lessons(course_id, slug),
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
DROP TABLE IF EXISTS course_staff;
DROP TABLE IF EXISTS courses;
