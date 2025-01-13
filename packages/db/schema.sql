SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: course_staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_staff (
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    title text,
    admin boolean DEFAULT false NOT NULL,
    can_edit_info boolean DEFAULT false NOT NULL,
    can_edit_content boolean DEFAULT false NOT NULL,
    can_grade_homeworks boolean DEFAULT false NOT NULL,
    can_manage_blog boolean DEFAULT false NOT NULL,
    can_manage_feedback boolean DEFAULT false NOT NULL
);


--
-- Name: course_students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_students (
    user_id uuid NOT NULL,
    course_id uuid NOT NULL
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    year integer DEFAULT date_part('year'::text, CURRENT_DATE) NOT NULL,
    semester integer,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    logo text,
    public boolean DEFAULT false NOT NULL,
    enrollment_open boolean DEFAULT false NOT NULL,
    archived boolean DEFAULT false NOT NULL,
    blog_enabled boolean DEFAULT false NOT NULL,
    feedback_enabled boolean DEFAULT false NOT NULL
);


--
-- Name: COLUMN courses.year; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.year IS 'Year in which the course takes place';


--
-- Name: COLUMN courses.semester; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.semester IS 'Optional semester in which the course takes place';


--
-- Name: COLUMN courses.slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.slug IS 'Machine-readable name of the course that is unique in combination with year and semester';


--
-- Name: COLUMN courses.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.title IS 'Human-readable name of the course';


--
-- Name: COLUMN courses.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.description IS 'Multi-line description of the course';


--
-- Name: COLUMN courses.logo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.logo IS 'URL of the course logo';


--
-- Name: homework_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homework_submissions (
    student_id uuid NOT NULL,
    homework_id uuid NOT NULL,
    attempt integer NOT NULL,
    solution text NOT NULL,
    comment text DEFAULT ''::text NOT NULL,
    feedback text DEFAULT ''::text NOT NULL,
    accepted boolean,
    reviewer_id uuid,
    submitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: COLUMN homework_submissions.solution; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.homework_submissions.solution IS 'Homework solution, usually in form of text or of an URL';


--
-- Name: COLUMN homework_submissions.comment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.homework_submissions.comment IS 'Student comment';


--
-- Name: COLUMN homework_submissions.feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.homework_submissions.feedback IS 'Feedback from reviewer';


--
-- Name: COLUMN homework_submissions.accepted; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.homework_submissions.accepted IS 'Whether homework is accepted or rejected by teacher. If set to NULL, it is not reviewed yet.';


--
-- Name: homeworks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homeworks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    lesson text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    is_solution_multiline boolean NOT NULL,
    solution_syntax_highlighting text
);


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    course_id uuid NOT NULL,
    slug text NOT NULL,
    "position" integer NOT NULL,
    title text NOT NULL,
    content text,
    icon text
);


--
-- Name: COLUMN lessons.slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.slug IS 'Machine-readable name of the lesson that is unique within a course';


--
-- Name: COLUMN lessons.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.title IS 'Human-readable name of the lesson';


--
-- Name: COLUMN lessons.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.content IS 'HTML content of the lesson';


--
-- Name: COLUMN lessons.icon; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.icon IS 'URL of the lesson icon';


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: user_login_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_login_attempts (
    code text NOT NULL,
    user_id uuid NOT NULL,
    expires timestamp with time zone NOT NULL
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires timestamp with time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text,
    last_name text,
    patronim text,
    email text,
    avatar text,
    bio text,
    tg_user_id bigint NOT NULL,
    tg_chat_id bigint NOT NULL,
    tg_username text NOT NULL,
    is_staff boolean DEFAULT false NOT NULL,
    can_create_courses boolean DEFAULT false NOT NULL,
    can_publish_courses boolean DEFAULT false NOT NULL
);


--
-- Name: COLUMN users.avatar; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.avatar IS 'URL of the user avatar';


--
-- Name: course_staff course_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_staff
    ADD CONSTRAINT course_staff_pkey PRIMARY KEY (user_id, course_id);


--
-- Name: course_students course_students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_students
    ADD CONSTRAINT course_students_pkey PRIMARY KEY (user_id, course_id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: courses courses_year_semester_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_year_semester_slug_key UNIQUE NULLS NOT DISTINCT (year, semester, slug);


--
-- Name: homework_submissions homework_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_pkey PRIMARY KEY (student_id, homework_id, attempt);


--
-- Name: homeworks homeworks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_course_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_position_key UNIQUE (course_id, "position");


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (course_id, slug);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: user_login_attempts user_login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_login_attempts
    ADD CONSTRAINT user_login_attempts_pkey PRIMARY KEY (code);


--
-- Name: user_login_attempts user_login_attempts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_login_attempts
    ADD CONSTRAINT user_login_attempts_user_id_key UNIQUE (user_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_tg_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tg_user_id_key UNIQUE (tg_user_id);


--
-- Name: course_staff course_staff_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_staff
    ADD CONSTRAINT course_staff_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_staff course_staff_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_staff
    ADD CONSTRAINT course_staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: course_students course_students_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_students
    ADD CONSTRAINT course_students_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_students course_students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_students
    ADD CONSTRAINT course_students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: homework_submissions homework_submissions_homework_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_homework_id_fkey FOREIGN KEY (homework_id) REFERENCES public.homeworks(id);


--
-- Name: homework_submissions homework_submissions_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: homework_submissions homework_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: homeworks homeworks_course_id_lesson_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_course_id_lesson_fkey FOREIGN KEY (course_id, lesson) REFERENCES public.lessons(course_id, slug);


--
-- Name: lessons lessons_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: user_login_attempts user_login_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_login_attempts
    ADD CONSTRAINT user_login_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20241213114857'),
    ('20241213191614');
