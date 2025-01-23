-- migrate:up

CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    sender_id UUID REFERENCES users(id) NULL
);

CREATE TABLE notification_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id UUID REFERENCES notifications(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    sent_at TIMESTAMPTZ
);

-- migrate:down

DROP TABLE IF EXISTS notification_messages;
DROP TABLE IF EXISTS notifications;
