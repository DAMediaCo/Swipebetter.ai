CREATE TABLE IF NOT EXISTS ios_transactions (
  id serial PRIMARY KEY,
  transaction_id varchar(128) NOT NULL UNIQUE,
  original_transaction_id varchar(128),
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id varchar(128) NOT NULL,
  environment varchar(32) NOT NULL,
  purchase_date timestamp,
  expires_date timestamp,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ios_transactions_user_id
  ON ios_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_ios_transactions_original_transaction_id
  ON ios_transactions(original_transaction_id);
