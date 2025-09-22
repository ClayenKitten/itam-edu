-- migrate:up

UPDATE courses SET semester = 'autumn'::semester_enum WHERE semester IS NULL;

ALTER TABLE courses
ALTER COLUMN semester SET NOT NULL;

-- migrate:down

ALTER TABLE courses
ALTER COLUMN semester SET NULL;
