-- migrate:up

CREATE TABLE manual_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    silent BOOLEAN NOT NULL,
    deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
COMMENT ON TABLE manual_notifications IS 'Notifications issued manually by admins';

CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    tg_message_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    manual_id UUID REFERENCES manual_notifications(id)
);
COMMENT ON TABLE notifications IS 'Notifications sent through Telegram bot';

-- migrate:down

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS manual_notifications;
