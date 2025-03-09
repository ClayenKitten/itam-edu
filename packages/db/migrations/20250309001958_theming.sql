-- migrate:up

ALTER TABLE courses
    ADD COLUMN status TEXT,
    ADD COLUMN banner TEXT,
    ADD COLUMN color_primary TEXT,
    ADD COLUMN color_on_primary TEXT;

-- migrate:down

ALTER TABLE courses
    DROP COLUMN status RESTRICT,
    DROP COLUMN banner RESTRICT,
    DROP COLUMN color_primary RESTRICT,
    DROP COLUMN color_on_primary RESTRICT;
