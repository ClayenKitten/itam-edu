-- migrate:up

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    patronim TEXT,
    email TEXT UNIQUE,
    avatar TEXT,
    bio TEXT,
    tg_user_id BIGINT NOT NULL,
    tg_chat_id BIGINT NOT NULL,
    tg_username TEXT NOT NULL
);
COMMENT ON COLUMN users.avatar IS 'URL of the user avatar';

CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    token_hash TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE staff_permissions (
    user_id UUID REFERENCES users(id) PRIMARY KEY,
    can_create_courses BOOLEAN NOT NULL DEFAULT true,
    can_publish_courses BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    code TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL
);

-- migrate:down

DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS staff_permissions;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;
