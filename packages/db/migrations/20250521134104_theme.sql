-- migrate:up

ALTER TABLE courses
    ADD COLUMN theme TEXT NOT NULL DEFAULT 'default',
    DROP COLUMN color_primary,
    DROP COLUMN color_on_primary;

-- migrate:down

ALTER TABLE courses
    DROP COLUMN theme,
    ADD COLUMN color_primary TEXT,
    ADD COLUMN color_on_primary TEXT;
