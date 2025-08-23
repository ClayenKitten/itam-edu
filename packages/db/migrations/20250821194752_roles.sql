-- migrate:up

-- users
CREATE TYPE global_role AS ENUM ('default', 'supervisor', 'admin');

ALTER TABLE users ADD COLUMN role global_role;

UPDATE users
SET role = CASE
  WHEN is_supervisor THEN 'supervisor'::global_role
  WHEN can_create_courses THEN 'admin'::global_role
  ELSE 'default'::global_role
END;

ALTER TABLE users ALTER COLUMN role SET DEFAULT 'default';
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

ALTER TABLE users
  DROP COLUMN IF EXISTS is_supervisor,
  DROP COLUMN IF EXISTS can_create_courses,
  DROP COLUMN IF EXISTS can_publish_courses;

-- user_courses
CREATE TYPE course_role AS ENUM ('student', 'teacher', 'admin');

ALTER TABLE user_courses ADD COLUMN role course_role;

UPDATE user_courses
SET role = CASE
  WHEN is_owner THEN 'admin'::course_role
  WHEN is_staff THEN 'teacher'::course_role
  ELSE 'student'::course_role
END;

ALTER TABLE user_courses ALTER COLUMN role SET NOT NULL;

ALTER TABLE user_courses
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS is_owner,
  DROP COLUMN IF EXISTS is_staff,
  DROP COLUMN IF EXISTS can_edit_info,
  DROP COLUMN IF EXISTS can_edit_content,
  DROP COLUMN IF EXISTS can_manage_submissions;

-- courses
ALTER TABLE courses ADD COLUMN owner_id UUID REFERENCES users(id);

UPDATE courses
SET owner_id = sub.user_id
FROM (
    SELECT DISTINCT ON (course_id) course_id, user_id
    FROM user_courses
    WHERE role = 'admin'::course_role
    ORDER BY course_id, user_id
) AS sub
WHERE courses.id = sub.course_id;

ALTER TABLE courses ALTER COLUMN owner_id SET NOT NULL;

-- migrate:down

-- users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_supervisor boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_create_courses boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_publish_courses boolean NOT NULL DEFAULT false;

UPDATE users
SET
  is_supervisor = (role = 'supervisor'::global_role),
  can_create_courses = (role = 'admin'::global_role),
  can_publish_courses = (role = 'admin'::global_role);

ALTER TABLE users DROP COLUMN IF EXISTS role;

DROP TYPE IF EXISTS global_role;

-- user_courses
ALTER TABLE user_courses
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS is_owner boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_staff boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_edit_info boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_edit_content boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_manage_submissions boolean NOT NULL DEFAULT false;

UPDATE user_courses
SET
  is_owner = (role = 'admin'::course_role),
  is_staff = (role = 'teacher'::course_role),
  can_edit_info = (role IN ('teacher'::course_role, 'admin'::course_role)),
  can_edit_content = (role IN ('teacher'::course_role, 'admin'::course_role)),
  can_manage_submissions = (role IN ('teacher'::course_role, 'admin'::course_role));

ALTER TABLE user_courses DROP COLUMN IF EXISTS role;

DROP TYPE IF EXISTS course_role;

-- courses
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_owner_id_fkey;
ALTER TABLE courses DROP COLUMN IF EXISTS owner_id;
