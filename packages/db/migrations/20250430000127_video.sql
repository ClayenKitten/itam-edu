-- migrate:up

ALTER TABLE lessons ADD COLUMN video TEXT;

-- migrate:down

ALTER TABLE lessons DROP COLUMN video;
