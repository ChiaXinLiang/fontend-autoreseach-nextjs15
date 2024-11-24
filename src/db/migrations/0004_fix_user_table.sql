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

-- Update foreign key constraints if they exist
DO $$
BEGIN
  -- Drop old constraints if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'account_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "account" DROP CONSTRAINT "account_user_id_user_id_fk";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'account_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'session_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'session_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_content_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "user_content" DROP CONSTRAINT "user_content_user_id_user_id_fk";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_content_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "user_content" ADD CONSTRAINT "user_content_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION;
  END IF;
END $$;
