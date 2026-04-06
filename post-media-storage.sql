-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own post media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy for anyone to read post media
CREATE POLICY "Anyone can read post media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'post-media'
  );

-- Create policy for users to update their own media
CREATE POLICY "Users can update their own post media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'post-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
