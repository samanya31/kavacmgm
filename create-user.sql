-- SQL Script to Create a CFO/Treasury User in Supabase Auth
-- Run this in your Supabase SQL Editor.
-- You can change the email and password values below as needed.

-- 1. Ensure the crypto extension is active (used for bcrypt password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create the user within a transaction block
DO $$
DECLARE
  new_user_uuid UUID := gen_random_uuid();
  user_email TEXT := 'diyanegi'; -- Can be a simple username/ID (e.g. 'diyanegi') or an email address
  user_password TEXT := 'diya@1234'; -- Change this to a secure password
BEGIN
  -- If user enters a simple username ID, auto-append local domain for Supabase compatibility
  IF user_email NOT LIKE '%@%' THEN
    user_email := user_email || '@kavachh.local';
  END IF;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RAISE EXCEPTION 'User with email/ID % already exists.', user_email;
  END IF;

  -- Insert user into auth.users table
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    new_user_uuid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf', 10)), -- Hashes password securely using bcrypt
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Insert matching identity record (required for email/password authentication flow)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_uuid,       -- uuid type
    new_user_uuid,       -- uuid type
    jsonb_build_object('sub', new_user_uuid::text, 'email', user_email),
    'email',
    new_user_uuid::text, -- text type
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'User % created successfully with ID %', user_email, new_user_uuid;
END $$;
