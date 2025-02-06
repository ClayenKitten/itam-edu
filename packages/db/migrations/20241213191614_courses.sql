-- migrate:up

CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INT NOT NULL DEFAULT date_part('year', CURRENT_DATE),
    semester INT,
    slug TEXT NOT NULL,
    UNIQUE NULLS NOT DISTINCT (year, semester, slug),
    title TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_enrollment_open BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    is_blog_enabled BOOLEAN NOT NULL DEFAULT false,
    is_feedback_enabled BOOLEAN NOT NULL DEFAULT false
);
COMMENT ON COLUMN courses.year IS 'Year in which the course takes place';
COMMENT ON COLUMN courses.semester IS 'Optional semester in which the course takes place';
COMMENT ON COLUMN courses.slug IS 'Machine-readable name of the course that is unique in combination with year and semester';
COMMENT ON COLUMN courses.title IS 'Human-readable name of the course';
COMMENT ON COLUMN courses.description IS 'Multi-line description of the course';
COMMENT ON COLUMN courses.logo IS 'URL of the course logo';

CREATE TABLE course_staff (
    user_id UUID REFERENCES users(id) NOT NULL,
    course_id UUID REFERENCES courses(id) NOT NULL,
    PRIMARY KEY (user_id, course_id),
    title TEXT,
    is_owner BOOLEAN NOT NULL DEFAULT false,
    can_edit_info BOOLEAN NOT NULL DEFAULT false,
    can_edit_content BOOLEAN NOT NULL DEFAULT false,
    can_manage_submissions BOOLEAN NOT NULL DEFAULT false,
    can_manage_blog BOOLEAN NOT NULL DEFAULT false,
    can_manage_feedback BOOLEAN NOT NULL DEFAULT false
);
COMMENT ON COLUMN course_staff.is_owner IS 'Whether user is owner of the course. Course owners can manage staff, add other owners and even delete courses';
COMMENT ON COLUMN course_staff.can_edit_info IS 'Whether user can edit primary course info';
COMMENT ON COLUMN course_staff.can_edit_content IS 'Whether user can edit course content such as lessons, homeworks, etc';
COMMENT ON COLUMN course_staff.can_manage_submissions IS 'Whether user can accept or reject submissions';
COMMENT ON COLUMN course_staff.can_manage_blog IS 'Whether user can write posts to blog';
COMMENT ON COLUMN course_staff.can_manage_feedback IS 'Whether user can modify feedback form';

CREATE TABLE course_students (
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE lessons (
    course_id UUID REFERENCES courses(id) NOT NULL,
    slug TEXT NOT NULL,
    PRIMARY KEY (course_id, slug),
    position INTEGER NOT NULL,
    UNIQUE (course_id, position) DEFERRABLE,
    title TEXT NOT NULL,
    content TEXT,
    icon TEXT
);
COMMENT ON COLUMN lessons.slug IS 'Machine-readable name of the lesson that is unique within a course';
COMMENT ON COLUMN lessons.title IS 'Human-readable name of the lesson';
COMMENT ON COLUMN lessons.content IS 'HTML content of the lesson';
COMMENT ON COLUMN lessons.icon IS 'URL of the lesson icon';

-- migrate:down

DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS course_students;
DROP TABLE IF EXISTS course_staff;
DROP TABLE IF EXISTS courses;
