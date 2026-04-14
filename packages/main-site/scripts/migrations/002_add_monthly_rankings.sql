-- 月度榜单数据表
-- 用于存储每月更新的工具排名数据

-- 月度榜单表
CREATE TABLE IF NOT EXISTS monthly_rankings (
  id SERIAL PRIMARY KEY,
  
  -- 排名信息
  rank INTEGER NOT NULL,                    -- 当月排名
  rank_change INTEGER DEFAULT 0,            -- 排名变化（与上月相比）
  
  -- 工具基本信息
  tool_id INTEGER REFERENCES tools(id) ON DELETE SET NULL,
  tool_name VARCHAR(200) NOT NULL,          -- 工具名称（冗余存储便于查询）
  tool_url VARCHAR(500) NOT NULL,           -- 工具官网URL
  tool_logo VARCHAR(500),                   -- 工具Logo URL
  tool_logo_backup VARCHAR(500),            -- 备用Logo URL
  tool_description VARCHAR(500),            -- 工具简介
  
  -- 流量数据（Similarweb数据）
  monthly_visits VARCHAR(50) NOT NULL,      -- 月访问量（如"1.4B"、"562.3M"）
  monthly_visits_num BIGINT,                -- 数字形式的访问量（用于排序）
  growth VARCHAR(50),                       -- 增长绝对值（如"+169.7M"、"-23.5M"）
  growth_num BIGINT,                        -- 数字形式的增长值
  growth_rate VARCHAR(20),                   -- 增长率（如"14.36%"、"-3.21%"）
  growth_rate_num DECIMAL(10,2),            -- 数字形式的增长率
  
  -- 排名信息
  global_rank INTEGER,                      -- 全球排名
  global_rank_change INTEGER DEFAULT 0,     -- 全球排名变化
  country_rank INTEGER,                     -- 国家/地区排名
  country_rank_change INTEGER DEFAULT 0,   -- 国家/地区排名变化
  
  -- 分类标签
  category VARCHAR(100),                    -- 主分类（如"AI Writing"）
  tags TEXT[],                              -- 标签数组
  
  -- 数据来源
  source_flag VARCHAR(50) DEFAULT 'manual', -- API拉取、manual手动
  data_status VARCHAR(20) DEFAULT 'valid',   -- valid有效、invalid失效、pending待校验
  
  -- 时间信息
  stats_month VARCHAR(7) NOT NULL,           -- 统计月份（格式"YYYY-MM"）
  update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(tool_name, stats_month)
);

-- 索引
CREATE INDEX IF NOT EXISTS monthly_rankings_stats_month_idx ON monthly_rankings(stats_month);
CREATE INDEX IF NOT EXISTS monthly_rankings_rank_idx ON monthly_rankings(rank);
CREATE INDEX IF NOT EXISTS monthly_rankings_growth_rate_idx ON monthly_rankings(growth_rate_num);
CREATE INDEX IF NOT EXISTS monthly_rankings_category_idx ON monthly_rankings(category);

-- 月度榜单历史归档表
CREATE TABLE IF NOT EXISTS monthly_rankings_archive (
  id SERIAL PRIMARY KEY,
  backup_month VARCHAR(7) NOT NULL,         -- 备份月份
  data JSONB NOT NULL,                      -- 完整数据备份
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS monthly_rankings_archive_backup_month_idx ON monthly_rankings_archive(backup_month);

-- 榜单配置表
CREATE TABLE IF NOT EXISTS ranking_configs (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初始化默认配置
INSERT INTO ranking_configs (config_key, config_value, description) VALUES
('update_schedule', '{"hour": 0, "minute": 0, "day": 1}', '自动更新计划'),
('retention_months', '24', '数据保留月数'),
('abnormal_threshold', '{"growth_rate": 1000, "rank_change": 20}', '异常阈值')
ON CONFLICT (config_key) DO NOTHING;

-- 榜单更新日志表
CREATE TABLE IF NOT EXISTS ranking_update_logs (
  id SERIAL PRIMARY KEY,
  update_month VARCHAR(7) NOT NULL,         -- 更新的月份
  update_type VARCHAR(20) NOT NULL,         -- full增量、manual手动
  status VARCHAR(20) NOT NULL,              -- success、failed、partial
  total_count INTEGER DEFAULT 0,           -- 更新数量
  error_count INTEGER DEFAULT 0,            -- 错误数量
  error_details JSONB,                      -- 错误详情
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ranking_update_logs_month_idx ON ranking_update_logs(update_month);
CREATE INDEX IF NOT EXISTS ranking_update_logs_status_idx ON ranking_update_logs(status);
