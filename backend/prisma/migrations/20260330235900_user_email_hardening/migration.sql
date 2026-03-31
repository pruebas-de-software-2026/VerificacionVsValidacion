-- Enforce lowercase emails at write-time and prevent case-insensitive duplicates.
-- This keeps semantic uniqueness consistent across all auth flows.

ALTER TABLE "User"
ADD CONSTRAINT "User_email_lowercase_chk"
CHECK ("email" = LOWER("email"));

CREATE UNIQUE INDEX "User_email_lower_key"
ON "User" (LOWER("email"));
