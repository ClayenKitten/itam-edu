-- migrate:up

-- Create table
CREATE TABLE homework_submission_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id UUID NOT NULL REFERENCES homeworks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted BOOLEAN NULL
);

-- Data migration
-- Migrate submissions
INSERT INTO homework_submission_messages (
    id,
    homework_id,
    student_id,
    user_id,
    content,
    sent_at,
    accepted
)
SELECT
    id,
    homework_id,
    student_id,
    student_id,
    concat_ws(E'\n\n', student_comment, solution), -- Double line break between comment and content
    submitted_at,
    null
FROM homework_submissions;

-- Migrate reviews
INSERT INTO homework_submission_messages (
    homework_id,
    student_id,
    user_id,
    content,
    sent_at,
    accepted
)
SELECT
    homework_id,
    student_id,
    reviewer_id,
    COALESCE(reviewer_comment, 'unknown'),
    reviewed_at,
    review_accepted
FROM homework_submissions
WHERE reviewer_id IS NOT NULL;

-- Drop old table and create view in its place
DROP TABLE homework_submissions;

CREATE VIEW homework_submissions AS
SELECT DISTINCT ON (homework_id, student_id)
    homework_id,
    student_id,
    accepted,
    sent_at AS last_message_at
FROM homework_submission_messages
ORDER BY homework_id, student_id, sent_at DESC;

-- migrate:down

DROP VIEW homework_submissions;

CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    homework_id UUID NOT NULL REFERENCES homeworks(id),
    solution TEXT NOT NULL,
    student_comment TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    review_accepted BOOLEAN,
    reviewer_id UUID REFERENCES users(id),
    reviewer_comment TEXT,
    reviewed_at TIMESTAMPTZ
);

-- Yeah, I'm not writing down data migration for that before production database even exists, sorry

DROP TABLE homework_submission_messages;
