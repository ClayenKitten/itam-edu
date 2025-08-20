-- migrate:up

CREATE TYPE semester_enum AS ENUM ('autumn', 'spring');

ALTER TABLE courses
ALTER COLUMN semester TYPE semester_enum USING
    CASE
        WHEN semester = 1 THEN 'spring'::semester_enum
        WHEN semester = 2 THEN 'autumn'::semester_enum
        ELSE NULL
    END;


-- migrate:down

ALTER TABLE courses
ALTER COLUMN semester TYPE integer USING
    CASE
        WHEN semester = 'spring' THEN 1
        WHEN semester = 'autumn' THEN 2
        ELSE NULL
    END;

DROP TYPE semester_enum;
