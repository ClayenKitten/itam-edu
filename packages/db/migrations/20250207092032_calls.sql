-- migrate:up

CREATE TABLE calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) NOT NULL,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ,
    scheduled_by UUID REFERENCES users(id),
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    started_by UUID REFERENCES users(id),
    ended_at TIMESTAMPTZ,
    duration INTEGER GENERATED ALWAYS AS (EXTRACT(epoch from (ended_at - started_at))) STORED
);
COMMENT ON COLUMN calls.duration IS 'Duration of the call in seconds';

CREATE TABLE call_attendees (
    user_id UUID REFERENCES users(id),
    call_id UUID REFERENCES calls(id),
    PRIMARY KEY (user_id, call_id),
    joined_at TIMESTAMPTZ NOT NULL,
    joined_duration INTEGER NOT NULL DEFAULT 0
);
COMMENT ON COLUMN call_attendees.joined_duration IS 'Duration in seconds that user stayed in the call';

ALTER TABLE course_staff ADD COLUMN can_manage_calls BOOLEAN NOT NULL DEFAULT false;

-- migrate:down

ALTER TABLE course_staff DROP COLUMN can_manage_calls;
DROP TABLE IF EXISTS call_attendees;
DROP TABLE IF EXISTS calls;
