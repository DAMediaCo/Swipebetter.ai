ALTER TABLE users
  ADD COLUMN IF NOT EXISTS apple_refresh_token_encrypted text,
  ADD COLUMN IF NOT EXISTS apple_refresh_token_client_id varchar;
