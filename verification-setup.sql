-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  method TEXT NOT NULL CHECK (method IN ('college_email', 'document_upload')),
  college_email TEXT,
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  attempt_count INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read their own verification records
CREATE POLICY "Users can view own verifications" ON verifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own verification records
CREATE POLICY "Users can insert own verifications" ON verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to check verification attempts in the last 7 days
CREATE OR REPLACE FUNCTION public.check_verification_attempts(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO attempt_count
  FROM verifications
  WHERE user_id = p_user_id
    AND method = 'document_upload'
    AND submitted_at >= NOW() - INTERVAL '7 days';
  
  RETURN attempt_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
