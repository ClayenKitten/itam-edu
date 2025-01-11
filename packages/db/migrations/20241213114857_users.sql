-- migrate:up

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    patronim TEXT,
    email TEXT UNIQUE,
    avatar TEXT,
    bio TEXT,
    tg_user_id BIGINT NOT NULL UNIQUE,
    tg_chat_id BIGINT NOT NULL,
    tg_username TEXT NOT NULL,
    is_staff BOOLEAN NOT NULL DEFAULT false,
    can_create_courses BOOLEAN NOT NULL DEFAULT false,
    can_publish_courses BOOLEAN NOT NULL DEFAULT false
);
COMMENT ON COLUMN users.avatar IS 'URL of the user avatar';

CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE user_login_attempts (
    code TEXT NOT NULL PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
    expires TIMESTAMPTZ NOT NULL
);

-- migrate:down

DROP TABLE IF EXISTS user_login_attempts;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;
