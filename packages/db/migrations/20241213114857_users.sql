-- migrate:up

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    patronim TEXT,
    email TEXT UNIQUE,
    is_public BOOLEAN NOT NULL,
    tg_user_id BIGINT NOT NULL,
    tg_chat_id BIGINT NOT NULL,
    tg_username TEXT NOT NULL
);

CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    token_hash TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE employees (
    user_id UUID REFERENCES users(id) PRIMARY KEY,
    bio TEXT,
    is_teacher BOOLEAN NOT NULL,
    is_course_admin BOOLEAN NOT NULL,
    is_tech_admin BOOLEAN NOT NULL
);

CREATE TABLE login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    code TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL
);

-- migrate:down

DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;
