-- Notifications Table Setup for CampX
-- This file creates the notifications table and necessary triggers

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'community_join', 'mention', 'post_created', 'community_invite')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_id UUID, -- Reference to post, community, etc.
    entity_type TEXT CHECK (entity_type IN ('post', 'community', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Added actor details for performance
    actor_name TEXT,
    actor_avatar TEXT,
    actor_campx_id TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Create RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = recipient_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- Policy: System can insert notifications
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Function to create notification for likes
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Don't create notification if user likes their own post
    IF NEW.user_id = (SELECT user_id FROM posts WHERE id = NEW.post_id) THEN
        RETURN NEW;
    END IF;
    
    INSERT INTO public.notifications (
        recipient_id,
        actor_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        actor_name,
        actor_campx_id
    )
    SELECT 
        posts.user_id,
        NEW.user_id,
        'like',
        'New Like',
        (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' liked your post',
        NEW.post_id,
        'post',
        (SELECT full_name FROM profiles WHERE id = NEW.user_id),
        (SELECT campx_id FROM profiles WHERE id = NEW.user_id)
    FROM posts WHERE posts.id = NEW.post_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for comments
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Don't create notification if user comments on their own post
    IF NEW.user_id = (SELECT user_id FROM posts WHERE id = NEW.post_id) THEN
        RETURN NEW;
    END IF;
    
    INSERT INTO public.notifications (
        recipient_id,
        actor_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        actor_name,
        actor_campx_id
    )
    SELECT 
        posts.user_id,
        NEW.user_id,
        'comment',
        'New Comment',
        (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' commented on your post',
        NEW.post_id,
        'post',
        (SELECT full_name FROM profiles WHERE id = NEW.user_id),
        (SELECT campx_id FROM profiles WHERE id = NEW.user_id)
    FROM posts WHERE posts.id = NEW.post_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for new followers
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (
        recipient_id,
        actor_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        actor_name,
        actor_campx_id
    )
    SELECT 
        NEW.following_id,
        NEW.follower_id,
        'follow',
        'New Follower',
        (SELECT full_name FROM profiles WHERE id = NEW.follower_id) || ' started following you',
        NEW.follower_id,
        'user',
        (SELECT full_name FROM profiles WHERE id = NEW.follower_id),
        (SELECT campx_id FROM profiles WHERE id = NEW.follower_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for community joins
CREATE OR REPLACE FUNCTION create_community_join_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify community admins about new members
    INSERT INTO public.notifications (
        recipient_id,
        actor_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        actor_name,
        actor_campx_id
    )
    SELECT 
        cm.user_id,
        NEW.user_id,
        'community_join',
        'New Community Member',
        (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' joined your community',
        NEW.community_id,
        'community',
        (SELECT full_name FROM profiles WHERE id = NEW.user_id),
        (SELECT campx_id FROM profiles WHERE id = NEW.user_id)
    FROM community_members cm
    WHERE cm.community_id = NEW.community_id 
    AND cm.role IN ('admin', 'moderator')
    AND cm.status = 'active';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS like_notification_trigger ON public.likes;
CREATE TRIGGER like_notification_trigger
    AFTER INSERT ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION create_like_notification();

DROP TRIGGER IF EXISTS comment_notification_trigger ON public.comments;
CREATE TRIGGER comment_notification_trigger
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION create_comment_notification();

DROP TRIGGER IF EXISTS follow_notification_trigger ON public.follows;
CREATE TRIGGER follow_notification_trigger
    AFTER INSERT ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION create_follow_notification();

DROP TRIGGER IF EXISTS community_join_notification_trigger ON public.community_members;
CREATE TRIGGER community_join_notification_trigger
    AFTER INSERT ON public.community_members
    FOR EACH ROW
    EXECUTE FUNCTION create_community_join_notification();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
