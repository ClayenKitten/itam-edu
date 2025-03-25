-- migrate:up

ALTER TABLE lessons RENAME COLUMN icon TO banner;

ALTER TABLE lessons
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN scheduled_at TIMESTAMPTZ;

-- migrate:down

ALTER TABLE lessons RENAME COLUMN banner TO icon;

ALTER TABLE lessons
    DROP COLUMN created_at,
    DROP COLUMN scheduled_at;
