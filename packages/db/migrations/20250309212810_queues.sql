-- migrate:up

UPDATE notification_messages SET sent_at = CURRENT_TIMESTAMP;

ALTER TABLE notification_messages
    ALTER COLUMN sent_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN sent_at SET NOT NULL,
    ADD COLUMN tg_message_id BIGINT;

-- migrate:down

ALTER TABLE notification_messages
    ALTER COLUMN sent_at DROP NOT NULL,
    DROP COLUMN tg_message_id;
