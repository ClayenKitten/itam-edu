-- migrate:up

CREATE TABLE homeworks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    solution_placeholder TEXT
);

CREATE TABLE homework_submissions (
    student_id UUID REFERENCES users(id) NOT NULL,
    homework_id UUID REFERENCES homeworks(id) NOT NULL,
    attempt INTEGER NOT NULL,
    PRIMARY KEY (student_id, homework_id, attempt),
    solution TEXT NOT NULL,
    student_comment TEXT,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    review_accepted BOOLEAN DEFAULT NULL,
    reviewer_id UUID REFERENCES users(id),
    reviewer_comment TEXT,
    reviewed_at TIMESTAMPTZ
);

-- migrate:down

DROP TABLE IF EXISTS homework_submissions;
DROP TABLE IF EXISTS homeworks;
