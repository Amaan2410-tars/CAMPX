-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create policy for authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own verification documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy for users to read their own documents
CREATE POLICY "Users can read their own verification documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy for users to update their own documents
CREATE POLICY "Users can update their own verification documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'verification-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
