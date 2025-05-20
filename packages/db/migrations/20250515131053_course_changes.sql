-- migrate:up

CREATE TABLE course_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES users(id) NOT NULL,
    course_id UUID REFERENCES courses(id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payload jsonb NOT NULL
);
CREATE INDEX idx_course_changes_course_id ON course_changes(course_id);

-- migrate:down

DROP TABLE course_changes;
