-- migrate:up

CREATE TYPE attendance_format AS ENUM ('online', 'offline');
CREATE TABLE lesson_attendees (
    lesson_id UUID REFERENCES lessons(id),
    user_id UUID REFERENCES users(id),
    PRIMARY KEY (user_id, lesson_id),
    manually_added_by UUID REFERENCES users(id),
    format attendance_format NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- migrate:down

DROP TABLE lesson_attendees;
DROP TYPE attendance_format;
