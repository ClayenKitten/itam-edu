-- migrate:up

ALTER TABLE courses
    DROP COLUMN logo,
    ADD COLUMN icon TEXT,
    ADD COLUMN cover TEXT;

-- migrate:down

ALTER TABLE courses
    DROP COLUMN icon,
    DROP COLUMN cover,
    ADD COLUMN logo TEXT;
