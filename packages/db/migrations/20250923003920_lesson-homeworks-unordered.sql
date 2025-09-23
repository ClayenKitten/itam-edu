-- migrate:up

ALTER TABLE lesson_homeworks DROP COLUMN position;

-- migrate:down

-- ...
