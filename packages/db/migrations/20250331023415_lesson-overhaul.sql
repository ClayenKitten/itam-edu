-- migrate:up

ALTER TABLE lessons
    ADD COLUMN description TEXT,
    ADD COLUMN is_online BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN is_offline BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN location TEXT,
    ADD CONSTRAINT chk_location_requires_offline CHECK (is_offline = true OR location IS null);

ALTER TABLE lessons
    ALTER COLUMN is_online DROP DEFAULT,
    ALTER COLUMN is_offline DROP DEFAULT;

CREATE TABLE lesson_homeworks (
    lesson_id UUID REFERENCES lessons(id) NOT NULL,
    homework_id UUID REFERENCES homeworks(id) NOT NULL,
    PRIMARY KEY (lesson_id, homework_id),
    position INTEGER NOT NULL,
    UNIQUE (lesson_id, homework_id, position)
);

-- migrate:down

DROP TABLE lesson_homeworks;

ALTER TABLE lessons
    DROP CONSTRAINT chk_location_requires_offline,
    DROP COLUMN location,
    DROP COLUMN is_offline,
    DROP COLUMN is_online,
    DROP COLUMN description;
