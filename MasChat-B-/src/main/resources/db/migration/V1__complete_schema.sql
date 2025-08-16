-- Complete database schema for MasChat application
-- This migration creates all tables needed for the application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(100),
    profile_picture VARCHAR(255),
    cover_photo VARCHAR(255),
    bio TEXT,
    avatar VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User details table
CREATE TABLE IF NOT EXISTS user_details (
    id BIGSERIAL PRIMARY KEY,
    profile_type VARCHAR(50) DEFAULT '',
    works_at1 VARCHAR(255),
    works_at2 VARCHAR(255),
    studied_at VARCHAR(255),
    went_to VARCHAR(255),
    current_city VARCHAR(255),
    hometown VARCHAR(255),
    relationship_status VARCHAR(50),
    show_avatar BOOLEAN DEFAULT FALSE,
    avatar VARCHAR(255),
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    profile_visibility BOOLEAN DEFAULT TRUE,
    show_online_status BOOLEAN DEFAULT TRUE,
    allow_friend_requests BOOLEAN DEFAULT TRUE,
    allow_messages_from_non_friends BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    friend_request_notifications BOOLEAN DEFAULT TRUE,
    message_notifications BOOLEAN DEFAULT TRUE,
    post_notifications BOOLEAN DEFAULT TRUE,
    marketplace_notifications BOOLEAN DEFAULT TRUE,
    auto_play_videos BOOLEAN DEFAULT TRUE,
    show_sensitive_content BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'en',
    region VARCHAR(10) DEFAULT 'US',
    two_factor_auth BOOLEAN DEFAULT FALSE,
    login_alerts BOOLEAN DEFAULT TRUE,
    session_timeout BOOLEAN DEFAULT TRUE,
    high_contrast_mode BOOLEAN DEFAULT FALSE,
    large_text BOOLEAN DEFAULT FALSE,
    screen_reader BOOLEAN DEFAULT FALSE,
    data_saver BOOLEAN DEFAULT FALSE,
    auto_download_media BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes table (for posts and comments)
CREATE TABLE IF NOT EXISTS likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    UNIQUE(comment_id, user_id)
);

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, receiver_id)
);

-- User friends junction table
CREATE TABLE IF NOT EXISTS user_friends (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    friend_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id)
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    media_url VARCHAR(255),
    media_type VARCHAR(20),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- Story likes table
CREATE TABLE IF NOT EXISTS story_likes (
    story_id BIGINT REFERENCES stories(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (story_id, user_id)
);

-- Reels table
CREATE TABLE IF NOT EXISTS reels (
    id BIGSERIAL PRIMARY KEY,
    caption TEXT,
    video_url VARCHAR(255),
    image_url VARCHAR(255),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reel likes table
CREATE TABLE IF NOT EXISTS reel_likes (
    reel_id BIGINT REFERENCES reels(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reel_id, user_id)
);

-- Reel comments table
CREATE TABLE IF NOT EXISTS reel_comments (
    id BIGSERIAL PRIMARY KEY,
    reel_id BIGINT REFERENCES reels(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
    id BIGSERIAL PRIMARY KEY,
    user1_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    user2_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user1_id, user2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    recipient_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    chat_id BIGINT REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    content VARCHAR(1000) NOT NULL,
    image VARCHAR(500),
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    url TEXT,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    related_id VARCHAR(255),
    related_type VARCHAR(50),
    sender_id BIGINT,
    sender_name VARCHAR(255),
    sender_avatar VARCHAR(255),
    read BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    category VARCHAR(100) DEFAULT 'General',
    image_url VARCHAR(255) DEFAULT 'https://i.imgur.com/default-group.png',
    created_by BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(group_id, user_id)
);

-- AI Chat table
CREATE TABLE IF NOT EXISTS ai_chats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Chat messages table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id BIGSERIAL PRIMARY KEY,
    ai_chat_id BIGINT REFERENCES ai_chats(id) ON DELETE CASCADE,
    content VARCHAR(4000) NOT NULL,
    is_user_message BOOLEAN NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_response_time_ms BIGINT,
    tokens_used INTEGER,
    model_used VARCHAR(100),
    error_message TEXT
);

-- Ad campaigns table
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_audience VARCHAR(255),
    budget DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'DRAFT',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feeds table
CREATE TABLE IF NOT EXISTS feeds (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feed posts junction table
CREATE TABLE IF NOT EXISTS feed_posts (
    feed_id BIGINT REFERENCES feeds(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    PRIMARY KEY (feed_id, post_id)
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace categories table
CREATE TABLE IF NOT EXISTS marketplace_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(255)
);

-- Marketplace items table
CREATE TABLE IF NOT EXISTS marketplace_items (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    negotiable BOOLEAN DEFAULT FALSE,
    category_id BIGINT REFERENCES marketplace_categories(id) ON DELETE CASCADE,
    seller_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    condition VARCHAR(50) NOT NULL,
    images TEXT[], -- Array of image URLs
    delivery_method VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace orders table
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT REFERENCES marketplace_items(id) ON DELETE CASCADE,
    buyer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    seller_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    phone_number VARCHAR(50),
    price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    delivery_method VARCHAR(50),
    payment_method VARCHAR(50),
    fee DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace reviews table
CREATE TABLE IF NOT EXISTS marketplace_reviews (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT REFERENCES marketplace_items(id) ON DELETE CASCADE,
    reviewer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace business accounts table
CREATE TABLE IF NOT EXISTS marketplace_business_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo VARCHAR(255),
    contact_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace saved searches table
CREATE TABLE IF NOT EXISTS marketplace_saved_searches (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(255) NOT NULL,
    filters TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User wallets table (MassCoin)
CREATE TABLE IF NOT EXISTS user_wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    wallet_address VARCHAR(255) UNIQUE,
    balance DECIMAL(18,6) NOT NULL DEFAULT 0,
    staked_amount DECIMAL(18,6) NOT NULL DEFAULT 0,
    total_earned DECIMAL(18,6) NOT NULL DEFAULT 0,
    total_spent DECIMAL(18,6) NOT NULL DEFAULT 0,
    wallet_type VARCHAR(20) NOT NULL DEFAULT 'CUSTODIAL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- MassCoin transactions table
CREATE TABLE IF NOT EXISTS mass_coin_transactions (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    recipient_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(18,6) NOT NULL,
    transaction_hash VARCHAR(255),
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    gas_fee DECIMAL(18,6),
    usd_value DECIMAL(18,6),
    description TEXT,
    block_number BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- MassCoin transfer requests table
CREATE TABLE IF NOT EXISTS mass_coin_transfer_requests (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    recipient_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(18,6) NOT NULL,
    message TEXT,
    context_type VARCHAR(50) NOT NULL,
    context_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Post likes junction table
CREATE TABLE IF NOT EXISTS post_likes (
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_comment_id ON likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_reels_user_id ON reels(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category_id ON marketplace_items(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_id ON marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller_id ON marketplace_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_mass_coin_transactions_sender_id ON mass_coin_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_mass_coin_transactions_recipient_id ON mass_coin_transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_mass_coin_transactions_status ON mass_coin_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mass_coin_transfer_requests_sender_id ON mass_coin_transfer_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_mass_coin_transfer_requests_recipient_id ON mass_coin_transfer_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_mass_coin_transfer_requests_status ON mass_coin_transfer_requests(status);
CREATE INDEX IF NOT EXISTS idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_ai_chat_id ON ai_chat_messages(ai_chat_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- Insert sample data for marketplace categories
INSERT INTO marketplace_categories (name, icon) VALUES 
('Electronics', '📱'),
('Fashion', '👕'),
('Home & Garden', '🏠'),
('Sports & Outdoors', '⚽'),
('Books & Media', '📚'),
('Automotive', '🚗'),
('Health & Beauty', '💄'),
('Toys & Games', '🎮'),
('Food & Beverages', '🍕'),
('Services', '🔧')
ON CONFLICT (name) DO NOTHING;

-- Insert system user for MassCoin operations
INSERT INTO users (username, email, password, "fullName", verified) VALUES 
('system', 'system@maschat.com', 'system_password_hash', 'MasChat System', true)
ON CONFLICT (username) DO NOTHING; 