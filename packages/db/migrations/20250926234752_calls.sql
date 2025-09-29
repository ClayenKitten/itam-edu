-- migrate:up

CREATE TABLE calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    cover TEXT,
    course_id UUID REFERENCES courses(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_by UUID NOT NULL REFERENCES users(id),
    ended_at TIMESTAMPTZ,
    ended_by UUID REFERENCES users(id)
);

ALTER TABLE lessons DROP COLUMN is_offline;

CREATE TABLE call_participants (
    user_id UUID REFERENCES users(id),
    call_id UUID REFERENCES calls(id),
    PRIMARY KEY (user_id, call_id),
    first_joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_left_at TIMESTAMPTZ,
    is_muted BOOLEAN NOT NULL DEFAULT false
);

-- migrate:down

ALTER TABLE lessons ADD COLUMN is_offline BOOLEAN;

DROP TABLE call_participants;
DROP TABLE calls;
