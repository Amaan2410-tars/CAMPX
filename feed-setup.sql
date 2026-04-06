-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('text', 'photo', 'poll', 'accomplish')),
  content TEXT,
  media_url TEXT,
  destination TEXT NOT NULL CHECK (destination IN ('explore', 'college', 'both')),
  is_accomplish BOOLEAN DEFAULT false,
  accomplish_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for posts
-- Anyone can read posts where destination is explore or both
CREATE POLICY "Anyone can read explore posts" ON posts
  FOR SELECT USING (destination IN ('explore', 'both'));

-- Anyone can read posts where destination is college or both
CREATE POLICY "Anyone can read college posts" ON posts
  FOR SELECT USING (destination IN ('college', 'both'));

-- Only post owner can insert their own posts
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only post owner can update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Only post owner can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint for one like per user per post
ALTER TABLE likes ADD CONSTRAINT unique_post_user_like UNIQUE (post_id, user_id);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for likes
-- Anyone can read likes
CREATE POLICY "Anyone can read likes" ON likes
  FOR SELECT USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Users can insert own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments
-- Anyone can read comments
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    college TEXT NOT NULL,
    course TEXT,
    year TEXT,
    bio TEXT,
    campx_id TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL DEFAULT 'basic',
    verification_status TEXT NOT NULL DEFAULT 'unverified',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_destination_created ON posts(destination, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_campx_id ON profiles(campx_id);
CREATE INDEX IF NOT EXISTS idx_profiles_college ON profiles(college);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
