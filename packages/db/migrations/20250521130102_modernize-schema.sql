-- migrate:up

ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
DROP TABLE notification_messages;
DROP TABLE notifications;

-- migrate:down

ALTER TABLE users ALTER COLUMN first_name DROP NOT NULL;

CREATE TABLE "public"."notifications" ( 
  "id" UUID NOT NULL DEFAULT gen_random_uuid() ,
  "text" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  "sender_id" UUID NULL,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users" ("id")
);
CREATE TABLE "public"."notification_messages" ( 
  "notification_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "sent_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  "tg_message_id" BIGINT NULL,
  CONSTRAINT "notification_messages_pkey" PRIMARY KEY ("notification_id", "user_id"),
  CONSTRAINT "notification_messages_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications" ("id"),
  CONSTRAINT "notification_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id")
);
