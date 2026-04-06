-- Community System Tables for CampX

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('college', 'open')),
    created_by UUID NOT NULL REFERENCES profiles(id),
    college TEXT, -- only for college type communities
    join_setting TEXT NOT NULL DEFAULT 'open' CHECK (join_setting IN ('open', 'request', 'invite')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    member_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Community members table
CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned', 'pending')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(community_id, user_id)
);

-- Community channels table
CREATE TABLE IF NOT EXISTS community_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'announcement', 'media', 'files')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Community messages table
CREATE TABLE IF NOT EXISTS community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on communities
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- RLS policies for communities
CREATE POLICY "Anyone can read approved communities" ON communities
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can insert communities" ON communities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only creator can update their own community" ON communities
    FOR UPDATE USING (created_by = auth.uid());

-- Enable RLS on community_members
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_members
CREATE POLICY "Anyone can read community members" ON community_members
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own membership" ON community_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can only delete their own membership" ON community_members
    FOR DELETE USING (user_id = auth.uid());

-- Enable RLS on community_channels
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_channels
CREATE POLICY "Community members can read channels" ON community_channels
    FOR SELECT USING (
        community_id IN (
            SELECT community_id FROM community_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Only community admin can insert and delete channels" ON community_channels
    FOR ALL USING (
        community_id IN (
            SELECT community_id FROM community_members 
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Enable RLS on community_messages
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_messages
CREATE POLICY "Community members can read messages in their communities" ON community_messages
    FOR SELECT USING (
        channel_id IN (
            SELECT cc.id FROM community_channels cc
            JOIN community_members cm ON cc.community_id = cm.community_id
            WHERE cm.user_id = auth.uid() AND cm.status = 'active'
        )
    );

CREATE POLICY "Community members can insert messages" ON community_messages
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        channel_id IN (
            SELECT cc.id FROM community_channels cc
            JOIN community_members cm ON cc.community_id = cm.community_id
            WHERE cm.user_id = auth.uid() AND cm.status = 'active'
        ) AND
        user_id = auth.uid()
    );

CREATE POLICY "Users can only delete their own messages" ON community_messages
    FOR DELETE USING (user_id = auth.uid());

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communities_status ON communities(status);
CREATE INDEX IF NOT EXISTS idx_communities_type ON communities(type);
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);
CREATE INDEX IF NOT EXISTS idx_communities_member_count ON communities(member_count);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_status ON community_members(status);
CREATE INDEX IF NOT EXISTS idx_community_channels_community_id ON community_channels(community_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_channel_id ON community_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON community_messages(user_id);

-- Realtime setup for community messages
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;

-- Function to update member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE communities 
    SET member_count = (
        SELECT COUNT(*) FROM community_members 
        WHERE community_id = NEW.community_id AND status = 'active'
    )
    WHERE id = NEW.community_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update member count
CREATE TRIGGER update_member_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON community_members
    FOR EACH ROW EXECUTE FUNCTION update_community_member_count();
