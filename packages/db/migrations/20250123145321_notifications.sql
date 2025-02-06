-- migrate:up

CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sender_id UUID REFERENCES users(id)
);

CREATE TABLE notification_messages (
    notification_id UUID REFERENCES notifications(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    PRIMARY KEY (notification_id, user_id),
    sent_at TIMESTAMPTZ
);

-- migrate:down

DROP TABLE IF EXISTS notification_messages;
DROP TABLE IF EXISTS notifications;
