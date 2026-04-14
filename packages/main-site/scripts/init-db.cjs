/**
 * 数据库初始化脚本
 * 使用说明：
 * 1. 确保已创建火山引擎 PostgreSQL 数据库
 * 2. 环境变量会自动从扣子平台注入
 * 3. 运行命令：node -e "require('./dist/init-db.js')"
 */

const pg = require('pg');
const { Pool } = pg;

// 从环境变量获取数据库配置
const config = {
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

if (process.env.DATABASE_URL) {
  config.connectionString = process.env.DATABASE_URL;
} else {
  config.host = process.env.PGHOST;
  config.port = parseInt(process.env.PGPORT || '5432');
  config.user = process.env.PGUSER || 'postgres';
  config.password = process.env.PGPASSWORD;
  config.database = process.env.PGDATABASE || 'postgres';
}

const pool = new Pool(config);

// 创建表结构
async function createTables() {
  console.log('🔧 开始创建表结构...');
  
  const sql = `
    -- 分类表
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

    -- 二级分类表
    CREATE TABLE IF NOT EXISTS sub_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100),
      parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- 工具表
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

    -- 标签表
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      type VARCHAR(20) DEFAULT 'tool',
      color VARCHAR(20),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- 用户评分表
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

    -- 用户收藏表
    CREATE TABLE IF NOT EXISTS user_favorites (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, tool_id)
    );

    -- 用户评论表
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

    -- 浏览历史表
    CREATE TABLE IF NOT EXISTS user_history (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
      viewed_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, tool_id)
    );

    -- 技能分类表
    CREATE TABLE IF NOT EXISTS skill_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE,
      icon VARCHAR(50),
      color VARCHAR(20),
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- 技能表
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

    -- 提示词表
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

    -- 教程表
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

    -- 广告表
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

    -- 创建索引
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
  `;

  await pool.query(sql);
  console.log('✅ 表结构创建成功！');
}

// 导入分类数据
async function importCategories() {
  console.log('📁 开始导入分类数据...');
  
  const categories = [
    { name: '视频生成', slug: 'video-generation', icon: 'Video', color: '#ff6b6b', sort_order: 1 },
    { name: '数字人', slug: 'digital-human', icon: 'User', color: '#4ecdc4', sort_order: 2 },
    { name: '视频编辑', slug: 'video-editing', icon: 'Scissors', color: '#45b7d1', sort_order: 3 },
    { name: 'AI绘画', slug: 'ai-drawing', icon: 'Palette', color: '#96ceb4', sort_order: 4 },
    { name: 'AI聊天', slug: 'ai-chat', icon: 'MessageCircle', color: '#a29bfe', sort_order: 5 },
    { name: 'AI配音', slug: 'ai-voice', icon: 'Mic', color: '#fd79a8', sort_order: 6 },
    { name: 'AI写作', slug: 'ai-writing', icon: 'PenTool', color: '#fdcb6e', sort_order: 7 },
    { name: 'AI编程', slug: 'ai-coding', icon: 'Code', color: '#6c5ce7', sort_order: 8 },
    { name: 'AI音频', slug: 'ai-audio', icon: 'Music', color: '#00cec9', sort_order: 9 },
    { name: 'AI办公', slug: 'ai-office', icon: 'Briefcase', color: '#e17055', sort_order: 10 },
    { name: 'AI搜索', slug: 'ai-search', icon: 'Search', color: '#74b9ff', sort_order: 11 },
    { name: 'AI营销', slug: 'ai-marketing', icon: 'TrendingUp', color: '#e84393', sort_order: 12 },
    { name: 'AI学习', slug: 'ai-learning', icon: 'GraduationCap', color: '#00b894', sort_order: 13 },
  ];

  for (const cat of categories) {
    await pool.query(
      `INSERT INTO categories (name, slug, icon, color, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         icon = EXCLUDED.icon,
         color = EXCLUDED.color,
         sort_order = EXCLUDED.sort_order`,
      [cat.name, cat.slug, cat.icon, cat.color, cat.sort_order]
    );
  }
  console.log(`✅ 导入 ${categories.length} 个分类`);
}

// 验证数据库连接
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ 数据库连接成功:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

// 主函数
async function main() {
  console.log('========================================');
  console.log('🚀 OneClaw 数据库初始化脚本');
  console.log('========================================\n');

  // 测试连接
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ 无法连接到数据库，请检查环境变量配置');
    process.exit(1);
  }

  try {
    await createTables();
    await importCategories();
    
    console.log('\n========================================');
    console.log('✅ 数据库初始化完成！');
    console.log('========================================');
    console.log('\n📌 下一步操作：');
    console.log('1. 访问 POST /api/admin/init-data 初始化基础数据');
    console.log('2. 访问 POST /api/admin/init-production 导入工具数据');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ 初始化失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
