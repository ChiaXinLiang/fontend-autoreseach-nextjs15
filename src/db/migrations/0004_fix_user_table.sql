-- Rename "user" table to "users" if it exists
ALTER TABLE IF EXISTS "user" RENAME TO "users";

-- If "users" table doesn't exist, create it
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text,
  "email" text NOT NULL,
  "email_verified" timestamp,
  "image" text,
  "hashed_password" text,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Update foreign key constraints
ALTER TABLE IF EXISTS "account"
  DROP CONSTRAINT IF EXISTS "account_user_id_user_id_fk",
  ADD CONSTRAINT "account_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE IF EXISTS "session"
  DROP CONSTRAINT IF EXISTS "session_user_id_user_id_fk",
  ADD CONSTRAINT "session_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE IF EXISTS "user_content"
  DROP CONSTRAINT IF EXISTS "user_content_user_id_user_id_fk",
  ADD CONSTRAINT "user_content_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION;
