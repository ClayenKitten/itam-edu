-- migrate:up
DROP VIEW IF EXISTS homework_submissions;
DROP TABLE IF EXISTS homework_submission_messages;

CREATE TABLE submission_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id UUID NOT NULL REFERENCES homeworks(id),
    student_id UUID NOT NULL REFERENCES users(id),
    content TEXT,
    files TEXT ARRAY NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE submission_reviews (
    attempt_id UUID PRIMARY KEY REFERENCES submission_attempts(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    accepted BOOLEAN NOT NULL,
    content TEXT,
    files TEXT ARRAY NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE IF EXISTS submission_reviews;
DROP TABLE IF EXISTS submission_attempts;

CREATE TABLE homework_submission_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id UUID NOT NULL REFERENCES homeworks(id),
    student_id UUID NOT NULL REFERENCES users(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted BOOLEAN
);

CREATE VIEW homework_submissions AS
SELECT DISTINCT ON (homework_id, student_id)
    homework_id,
    student_id,
    accepted,
    sent_at AS last_message_at
FROM homework_submission_messages
ORDER BY homework_id, student_id, sent_at DESC;
