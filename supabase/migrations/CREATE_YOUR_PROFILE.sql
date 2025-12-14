-- =============================================
-- Create Profile for romelloswinton@gmail.com
-- =============================================

-- Insert your profile
INSERT INTO profiles (id, email, username, full_name, tier)
VALUES (
  '68b5fe16-203c-4e77-a30f-8b910604bfd5',
  'romelloswinton@gmail.com',
  'romelloswinton',
  'Romello Swinton',
  'FREE'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  updated_at = NOW();

-- Verify profile was created
SELECT
  '✅ Profile Created!' as status,
  id,
  email,
  username,
  tier,
  created_at
FROM profiles
WHERE id = '68b5fe16-203c-4e77-a30f-8b910604bfd5';
