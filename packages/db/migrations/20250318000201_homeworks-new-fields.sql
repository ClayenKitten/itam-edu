-- migrate:up

ALTER TABLE homeworks ADD COLUMN position INTEGER;
WITH ranked AS (
    SELECT id, course_id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY id) AS new_position
    FROM homeworks
)
    UPDATE homeworks
    SET position = ranked.new_position
    FROM ranked
    WHERE homeworks.id = ranked.id;
ALTER TABLE homeworks
    ALTER COLUMN position SET NOT NULL,
    ADD CONSTRAINT homeworks_course_id_position_key UNIQUE (course_id, position) DEFERRABLE;

ALTER TABLE homeworks
    DROP COLUMN solution_placeholder,
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN deadline TIMESTAMPTZ,
    ADD COLUMN accepting_submissions_override BOOLEAN,
    ALTER COLUMN content DROP NOT NULL;

ALTER TABLE homework_submissions
    DROP COLUMN attempt,
    ALTER COLUMN submitted_at SET NOT NULL;

-- migrate:down

UPDATE homeworks SET content = '' WHERE content is null;

ALTER TABLE homeworks
    DROP CONSTRAINT homeworks_course_id_position_key,
    DROP COLUMN position,
    ADD COLUMN solution_placeholder TEXT,
    DROP COLUMN created_at,
    DROP COLUMN deadline,
    DROP COLUMN accepting_submissions_override,
    ALTER COLUMN content SET NOT NULL;

ALTER TABLE homework_submissions
    ADD COLUMN attempt INTEGER NOT NULL,
    ALTER COLUMN submitted_at DROP NOT NULL;
