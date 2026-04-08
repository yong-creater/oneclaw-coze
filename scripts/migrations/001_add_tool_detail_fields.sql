-- 工具表新增字段迁移
-- 运行此SQL将以下字段添加到tools表中

-- 描述信息
ALTER TABLE tools ADD COLUMN IF NOT EXISTS short_desc TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS full_desc TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS use_guide TEXT;

-- 联系信息
ALTER TABLE tools ADD COLUMN IF NOT EXISTS customer_email VARCHAR(200);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS feedback_link VARCHAR(500);

-- 适用场景 (JSON数组)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS scenes JSONB DEFAULT '[]';
COMMENT ON COLUMN tools.scenes IS '适用场景 [{"scene_no":"#1","user_group":"学生/科研人群","scene_desc":"用于学术资料检索..."}]';

-- 核心功能 (JSON数组)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS functions JSONB DEFAULT '[]';
COMMENT ON COLUMN tools.functions IS '核心功能 [{"func_name":"智能搜索","func_desc":"..."}]';

-- 常见问题 (JSON数组)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]';
COMMENT ON COLUMN tools.faqs IS '常见问题 [{"question":"是否免费？","answer":"..."}]';

-- 设置默认值（如果列已存在但需要设置默认值）
ALTER TABLE tools ALTER COLUMN scenes SET DEFAULT '[]';
ALTER TABLE tools ALTER COLUMN functions SET DEFAULT '[]';
ALTER TABLE tools ALTER COLUMN faqs SET DEFAULT '[]';
