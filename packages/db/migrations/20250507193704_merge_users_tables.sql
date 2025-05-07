-- migrate:up

-- Create the merged table
CREATE TABLE user_courses (
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  PRIMARY KEY (user_id, course_id),
  is_staff BOOLEAN NOT NULL DEFAULT false,
  title TEXT,
  is_owner BOOLEAN NOT NULL DEFAULT false,
  can_edit_info BOOLEAN NOT NULL DEFAULT false,
  can_edit_content BOOLEAN NOT NULL DEFAULT false,
  can_manage_submissions BOOLEAN NOT NULL DEFAULT false
);

-- Migrate student records
INSERT INTO user_courses (user_id, course_id, is_staff)
SELECT user_id, course_id, false
FROM course_students;

-- Migrate staff records, updating any existing student rows
INSERT INTO user_courses (
  user_id,
  course_id,
  is_staff,
  title,
  is_owner,
  can_edit_info,
  can_edit_content,
  can_manage_submissions
)
SELECT
  user_id,
  course_id,
  true,
  title,
  is_owner,
  can_edit_info,
  can_edit_content,
  can_manage_submissions
FROM course_staff
ON CONFLICT (user_id, course_id) DO UPDATE
  SET
    is_staff = true,
    title = excluded.title,
    is_owner = excluded.is_owner,
    can_edit_info = excluded.can_edit_info,
    can_edit_content = excluded.can_edit_content,
    can_manage_submissions = excluded.can_manage_submissions;

-- Drop old tables
DROP TABLE course_staff;
DROP TABLE course_students;

-- migrate:down

CREATE TABLE course_students (
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE course_staff (
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  title TEXT,
  is_owner BOOLEAN NOT NULL DEFAULT false,
  can_edit_info BOOLEAN NOT NULL DEFAULT false,
  can_edit_content BOOLEAN NOT NULL DEFAULT false,
  can_manage_submissions BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, course_id)
);

INSERT INTO course_students (user_id, course_id)
SELECT user_id, course_id
FROM user_courses
WHERE is_staff = false;

INSERT INTO course_staff (
  user_id,
  course_id,
  title,
  is_owner,
  can_edit_info,
  can_edit_content,
  can_manage_submissions
)
SELECT
  user_id,
  course_id,
  title,
  is_owner,
  can_edit_info,
  can_edit_content,
  can_manage_submissions
FROM user_courses
WHERE is_staff = true;

DROP TABLE user_courses;
