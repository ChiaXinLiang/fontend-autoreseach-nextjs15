-- Create users table first
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text,
  "email" text NOT NULL,
  "email_verified" text,
  "image" text,
  "hashed_password" text,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Create account table
CREATE TABLE IF NOT EXISTS "account" (
  "user_id" text NOT NULL,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" timestamp,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider", "provider_account_id"),
  CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create session table
CREATE TABLE IF NOT EXISTS "session" (
  "session_token" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "expires" timestamp NOT NULL,
  CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create user_content table
CREATE TABLE IF NOT EXISTS "user_content" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "content_type" text NOT NULL,
  "filename" text NOT NULL,
  "s3_key" text NOT NULL,
  "title" text,
  "description" text,
  "tags" text[],
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);
