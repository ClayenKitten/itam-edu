-- migrate:up

ALTER TABLE lessons DROP CONSTRAINT lessons_pkey; -- Remove Primary key
ALTER TABLE lessons RENAME COLUMN slug TO id; -- Rename column
ALTER TABLE lessons ALTER COLUMN id TYPE UUID USING gen_random_uuid(); -- Set new value
ALTER TABLE lessons ALTER COLUMN id SET DEFAULT gen_random_uuid(); -- Update default
ALTER TABLE lessons ADD CONSTRAINT lessons_pkey PRIMARY KEY (id); -- Add new Primary key

-- migrate:down

ALTER TABLE lessons DROP CONSTRAINT lessons_pkey; -- Remove Primary key
ALTER TABLE lessons RENAME COLUMN id TO slug; -- Rename column
ALTER TABLE lessons ALTER COLUMN slug TYPE TEXT USING slug::TEXT; -- Set new value
ALTER TABLE lessons ALTER COLUMN slug DROP DEFAULT; -- Update default
ALTER TABLE lessons ADD CONSTRAINT lessons_pkey PRIMARY KEY (course_id, slug); -- Add new Primary key
