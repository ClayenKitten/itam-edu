-- migrate:up

ALTER TABLE courses ADD COLUMN about TEXT NOT NULL DEFAULT '';

-- migrate:down

ALTER TABLE courses DROP COLUMN about;
