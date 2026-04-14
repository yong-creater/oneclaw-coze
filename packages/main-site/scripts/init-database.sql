-- ==============================================
-- OneClaw 数据库初始化脚本
-- 在火山引擎 PostgreSQL 控制台直接执行
-- ==============================================

-- 1. 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 创建二级分类表
CREATE TABLE IF NOT EXISTS sub_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100),
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 创建工具表
CREATE TABLE IF NOT EXISTS tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    logo VARCHAR(500),
    producer VARCHAR(200),
    highlight VARCHAR(200),
    short_desc TEXT,
    full_desc TEXT,
    use_guide TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    free_type VARCHAR(50) DEFAULT '免费试用',
    free_quota_desc VARCHAR(200),
    feature_tags TEXT[] DEFAULT '{}',
    functions JSONB DEFAULT '[]',
    scenes JSONB DEFAULT '[]',
    faqs JSONB DEFAULT '[]',
    max_duration VARCHAR(50),
    official_url VARCHAR(500),
    promotion_url VARCHAR(500),
    is_official BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    launch_date DATE,
    rating_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    sponsor_type VARCHAR(20),
    advantages TEXT[],
    limitations TEXT[],
    commercial_license VARCHAR(100),
    customer_email VARCHAR(200),
    feedback_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 创建标签表
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) DEFAULT 'tool',
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. 创建用户评分表
CREATE TABLE IF NOT EXISTS user_ratings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
    effect_score INTEGER CHECK (effect_score >= 1 AND effect_score <= 5),
    usability_score INTEGER CHECK (usability_score >= 1 AND usability_score <= 5),
    quota_score INTEGER CHECK (quota_score >= 1 AND quota_score <= 5),
    stability_score INTEGER CHECK (stability_score >= 1 AND stability_score <= 5),
    overall_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

-- 6. 创建用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

-- 7. 创建用户评论表
CREATE TABLE IF NOT EXISTS user_reviews (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. 创建浏览历史表
CREATE TABLE IF NOT EXISTS user_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

-- 9. 创建技能分类表
CREATE TABLE IF NOT EXISTS skill_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. 创建技能表
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200),
    description TEXT,
    logo VARCHAR(500),
    category_id INTEGER REFERENCES skill_categories(id) ON DELETE SET NULL,
    official_url VARCHAR(500),
    tags TEXT[],
    difficulty VARCHAR(20),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. 创建提示词表
CREATE TABLE IF NOT EXISTS prompts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    tool_id INTEGER REFERENCES tools(id) ON DELETE SET NULL,
    category VARCHAR(50),
    tags TEXT[],
    uses INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 12. 创建教程表
CREATE TABLE IF NOT EXISTS tutorials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    tool_id INTEGER REFERENCES tools(id) ON DELETE SET NULL,
    category VARCHAR(50),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. 创建广告表
CREATE TABLE IF NOT EXISTS advertisements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    position VARCHAR(50),
    priority INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    starts_at TIMESTAMP DEFAULT NOW(),
    ends_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_highlight BOOLEAN DEFAULT false,
    target_category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 创建索引
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_free_type ON tools(free_type);
CREATE INDEX IF NOT EXISTS idx_tools_is_active ON tools(is_active);
CREATE INDEX IF NOT EXISTS idx_tools_is_featured ON tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_click_count ON tools(click_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_ratings_tool ON user_ratings(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_tool ON user_reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_prompts_tool ON prompts(tool_id);
CREATE INDEX IF NOT EXISTS idx_tutorials_tool ON tutorials(tool_id);

-- ==============================================
-- 插入分类数据
-- ==============================================
INSERT INTO categories (name, slug, icon, color, sort_order) VALUES
    ('视频生成', 'video-generation', 'Video', '#ff6b6b', 1),
    ('数字人', 'digital-human', 'User', '#4ecdc4', 2),
    ('视频编辑', 'video-editing', 'Scissors', '#45b7d1', 3),
    ('AI绘画', 'ai-drawing', 'Palette', '#96ceb4', 4),
    ('AI聊天', 'ai-chat', 'MessageCircle', '#a29bfe', 5),
    ('AI配音', 'ai-voice', 'Mic', '#fd79a8', 6),
    ('AI写作', 'ai-writing', 'PenTool', '#fdcb6e', 7),
    ('AI编程', 'ai-coding', 'Code', '#6c5ce7', 8),
    ('AI音频', 'ai-audio', 'Music', '#00cec9', 9),
    ('AI办公', 'ai-office', 'Briefcase', '#e17055', 10),
    ('AI搜索', 'ai-search', 'Search', '#74b9ff', 11),
    ('AI营销', 'ai-marketing', 'TrendingUp', '#e84393', 12),
    ('AI学习', 'ai-learning', 'GraduationCap', '#00b894', 13)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order;

-- ==============================================
-- 插入二级分类数据
-- ==============================================
WITH cat_ids AS (
    SELECT id, slug FROM categories WHERE slug IN ('video-generation', 'digital-human', 'video-editing', 'ai-voice')
)
INSERT INTO sub_categories (name, slug, parent_id, sort_order)
SELECT sub.name, sub.slug, c.id, sub.sort_order
FROM (
    VALUES 
        ('口播视频', 'talking-video', 2),
        ('电商带货', 'e-commerce', 1),
        ('动漫制作', 'anime-making', 3),
        ('知识科普', 'knowledge', 1),
        ('长视频生成', 'long-video', 1),
        ('短视频生成', 'short-video', 1),
        ('去水印', 'remove-watermark', 3),
        ('声音克隆', 'voice-clone', 6)
) AS sub(name, slug, sort_order)
JOIN cat_ids c ON (
    (sub.slug = 'talking-video' AND c.slug = 'digital-human') OR
    (sub.slug IN ('e-commerce', 'knowledge', 'long-video', 'short-video') AND c.slug = 'video-generation') OR
    (sub.slug IN ('anime-making', 'remove-watermark') AND c.slug = 'video-editing') OR
    (sub.slug = 'voice-clone' AND c.slug = 'ai-voice')
)
ON CONFLICT DO NOTHING;

-- ==============================================
-- 插入标签数据
-- ==============================================
INSERT INTO tags (name, type) VALUES
    ('完全免费', 'free_type'),
    ('免费额度', 'free_type'),
    ('限时免费', 'free_type'),
    ('付费工具', 'free_type'),
    ('支持中文', 'feature'),
    ('4K分辨率', 'feature'),
    ('长视频生成', 'feature'),
    ('数字人口播', 'feature'),
    ('图生视频', 'feature'),
    ('文生视频', 'feature'),
    ('AI配音', 'feature'),
    ('去水印', 'feature'),
    ('1分钟以内', 'duration'),
    ('1-10分钟', 'duration'),
    ('10分钟以上', 'duration'),
    ('可免费商用', 'license'),
    ('需授权商用', 'license'),
    ('不可商用', 'license'),
    ('口播视频', 'scene'),
    ('电商带货', 'scene'),
    ('动漫制作', 'scene'),
    ('知识科普', 'scene')
ON CONFLICT DO NOTHING;

-- ==============================================
-- 验证结果
-- ==============================================
SELECT '分类数量' as item, COUNT(*) as count FROM categories
UNION ALL
SELECT '工具数量', COUNT(*) FROM tools
UNION ALL
SELECT '标签数量', COUNT(*) FROM tags;
