-- migrate:up

DROP TABLE user_login_attempts;

-- migrate:down

CREATE TABLE "public"."user_login_attempts" ( 
  "code" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT "user_login_attempts_pkey" PRIMARY KEY ("code"),
  CONSTRAINT "user_login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id"),
  CONSTRAINT "user_login_attempts_user_id_key" UNIQUE ("user_id")
);
