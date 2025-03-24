-- migrate:up

ALTER TABLE users
    DROP COLUMN is_staff,
    ADD COLUMN is_supervisor BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE course_staff
    DROP COLUMN can_manage_blog,
    DROP COLUMN can_manage_feedback;

ALTER TABLE courses
    DROP COLUMN is_blog_enabled,
    DROP COLUMN is_feedback_enabled;

-- migrate:down

ALTER TABLE users
    ADD COLUMN is_staff BOOLEAN NOT NULL DEFAULT false,
    DROP COLUMN is_supervisor;

ALTER TABLE course_staff
    ADD COLUMN can_manage_blog BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN can_manage_feedback BOOLEAN NOT NULL DEFAULT false;
COMMENT ON COLUMN course_staff.can_manage_blog IS 'Whether user can write posts to blog';
COMMENT ON COLUMN course_staff.can_manage_feedback IS 'Whether user can modify feedback form';

ALTER TABLE courses
    ADD COLUMN is_blog_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN is_feedback_enabled BOOLEAN NOT NULL DEFAULT false;
