-- ============================================
-- OneClaw 数据库更新脚本 - 生产环境
-- 执行时间: 2026-04-14
-- ============================================

-- ============================================
-- 1. 工具表去重
-- ============================================
-- 删除 tools 表中按 name 去重，保留 ID 最小的记录
DELETE FROM tools 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rn
    FROM tools
  ) t
  WHERE rn > 1
);

-- 显示去重结果
SELECT '工具去重完成，当前工具数量:' as msg, COUNT(*) as count FROM tools;

-- ============================================
-- 2. 技能分类数据导入
-- ============================================

-- 先清空现有分类（如果有冲突）
TRUNCATE TABLE skill_categories RESTART IDENTITY CASCADE;

-- 插入技能分类
INSERT INTO skill_categories (id, name, slug, description, icon, color, sort_order, is_active, created_at, updated_at) VALUES
(9, 'AI', 'ai', 'SkillHub AI 分类，汇聚优质 AI 技能', '🤖', '#8B5CF6', 0, true, NOW(), NOW()),
(10, '智能开发', 'dev', 'SkillHub 智能开发 分类，汇聚优质 AI 技能', '💻', '#3B82F6', 1, true, NOW(), NOW()),
(11, '工具效率', 'tools', 'SkillHub 工具效率 分类，汇聚优质 AI 技能', '⚡', '#10B981', 2, true, NOW(), NOW()),
(12, '提升', 'improve', 'SkillHub 提升 分类，汇聚优质 AI 技能', '📈', '#F59E0B', 4, true, NOW(), NOW()),
(13, '数据分析', 'data', 'SkillHub 数据分析 分类，汇聚优质 AI 技能', '📊', '#EC4899', 3, true, NOW(), NOW()),
(14, '内容创作', 'content', 'SkillHub 内容创作 分类，汇聚优质 AI 技能', '✍️', '#EF4444', 4, true, NOW(), NOW()),
(15, '安全合规', 'security', 'SkillHub 安全合规 分类，汇聚优质 AI 技能', '🔒', '#06B6D4', 5, true, NOW(), NOW()),
(16, '通讯协作', 'communication', 'SkillHub 通讯协作 分类，汇聚优质 AI 技能', '💬', '#F97316', 6, true, NOW(), NOW());

SELECT '技能分类导入完成:' as msg, COUNT(*) as count FROM skill_categories;

-- ============================================
-- 3. 技能数据导入
-- ============================================

-- 先清空现有技能（如果有冲突）
TRUNCATE TABLE skills RESTART IDENTITY CASCADE;

-- 插入技能数据
INSERT INTO skills (name, slug, description, icon, logo, category_id, official_url, documentation_url, github_url, pricing, difficulty, tags, feature_list, is_featured, is_active, view_count, click_count, created_at, updated_at) VALUES
('self-improving-agent', 'skillhub-self-improving-agent', 'self-improving-agent - 来自 SkillHub 的精选 AI 技能', NULL, NULL, 9, 'https://skillhub.cn/skills/self-improving-agent', NULL, NULL, '免费', '入门', '["Agent"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Find Skills', 'skillhub-find-skills', '当用户询问"如何做某事"、"寻找某技能"或希望扩展功能时，帮助发现并安装智能体技能。适用于寻找可安装功能的场景。', NULL, 'https://aka.doubaocdn.com/s/1wvn1wDcmP', 9, 'https://skillhub.cn/skills/find-skills', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, false, true, 0, 0, NOW(), NOW()),
('Summarize', 'skillhub-summarize', '使用summarize CLI总结URL或文件（支持网页、PDF、图片、音频、YouTube）。', NULL, 'https://aka.doubaocdn.com/s/QDZE1wDcmP', 11, 'https://skillhub.cn/skills/summarize', NULL, NULL, '免费', '入门', '["浏览器", "图像", "总结", "CLI"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Agent Browser', 'skillhub-agent-browser', '基于Rust的快速无头浏览器自动化CLI，支持Node.js回退，允许AI代理通过结构化命令执行页面导航、点击、输入和快照操作。', NULL, 'https://aka.doubaocdn.com/s/qnQs1wDcmP', 10, 'https://skillhub.cn/skills/agent-browser', NULL, NULL, '免费', '入门', '["Agent", "浏览器", "自动化", "CLI"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Self-Improving + Proactive Agent', 'skillhub-self-improving', '自我反思+自我批评+自我学习+自组织记忆。智能体评估自身工作、发现错误并持续改进。', NULL, 'https://aka.doubaocdn.com/s/K1lR1wDcmQ', 9, 'https://skillhub.cn/skills/self-improving', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, false, true, 0, 0, NOW(), NOW()),
('Github', 'skillhub-github', '使用 `gh` CLI 与 GitHub 交互，通过 `gh issue`、`gh pr`、`gh run` 和 `gh api` 管理议题、PR、CI 运行及高级查询。', NULL, 'https://aka.doubaocdn.com/s/jire1wDcmQ', 10, 'https://skillhub.cn/skills/github', NULL, NULL, '免费', '入门', '["Git", "API", "CLI"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('ontology', 'skillhub-ontology', '类型化知识图谱，用于结构化智能体记忆与可组合技能。支持创建/查询实体（人员、项目、任务、事件、文档）及关联...', NULL, 'https://aka.doubaocdn.com/s/lfnw1wDcmQ', 9, 'https://skillhub.cn/skills/ontology', NULL, NULL, '免费', '入门', '["知识图谱"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Skill Vetter', 'skillhub-skill-vetter', 'AI智能体技能安全预审工具。安装ClawdHub、GitHub等来源技能前，检查风险信号、权限范围及可疑模式。', NULL, 'https://aka.doubaocdn.com/s/s2wt1wDcmQ', 15, 'https://skillhub.cn/skills/skill-vetter', NULL, NULL, '免费', '入门', '["Git", "安全"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Proactive Agent', 'skillhub-proactive-agent', '将AI智能体从任务执行者升级为主动预判需求、持续优化的智能伙伴。集成WAL协议、工作缓冲区、自主定时任务及实战验证模式。Hal Stack核心组件 🦞', NULL, 'https://aka.doubaocdn.com/s/70B91wDcmQ', 9, 'https://skillhub.cn/skills/proactive-agent', NULL, NULL, '免费', '入门', '["Agent"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Gog', 'skillhub-gog', 'Google Workspace 命令行工具，支持 Gmail、日历、云端硬盘、通讯录、表格和文档。', NULL, 'https://aka.doubaocdn.com/s/aB5Z1wDcmR', 9, 'https://skillhub.cn/skills/gog', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, false, true, 0, 0, NOW(), NOW()),
('Weather', 'skillhub-weather', '获取当前天气和预报（无需API密钥）', NULL, 'https://aka.doubaocdn.com/s/VSc01wDcmR', 9, 'https://skillhub.cn/skills/weather', NULL, NULL, '免费', '入门', '["API"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Nano Banana Pro', 'skillhub-nano-banana-pro', '使用 Nano Banana Pro (Gemini 3 Pro Image) 生成或编辑图像。支持文生图、图生图及 1K/2K/4K 分辨率，适用于图像创建、修改及编辑请求，使用 --input-image 指定输入图像。', NULL, 'https://aka.doubaocdn.com/s/OLQd1wDcmR', 9, 'https://skillhub.cn/skills/nano-banana-pro', NULL, NULL, '免费', '入门', '["图像"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('CodeConductor.ai', 'skillhub-codeconductor', 'AI驱动平台，提供快速全栈开发、智能体、工作流自动化及低代码AI集成的可扩展产品创建。', NULL, 'https://aka.doubaocdn.com/s/e9Cc1wDcmR', 10, 'https://skillhub.cn/skills/codeconductor', NULL, NULL, '免费', '入门', '["代码", "自动化"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Humanizer', 'skillhub-humanizer', '消除AI写作痕迹，使文本更自然真实。基于维基百科"AI写作特征"指南，识别并修正夸张象征、宣传用语、肤浅-ing分析、模糊归因、破折号滥用、三项排比、AI词汇、负面平行结构及冗长连接词等模式。', NULL, 'https://aka.doubaocdn.com/s/cAag1wDcmS', 9, 'https://skillhub.cn/skills/humanizer', NULL, NULL, '免费', '入门', '["写作"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Multi Search Engine', 'skillhub-multi-search-engine', '集成17个搜索引擎（8国内+9国际），支持高级搜索语法、时间筛选、站内搜索、隐私引擎及WolframAlpha知识查询，无需API密钥。', NULL, 'https://aka.doubaocdn.com/s/dOsk1wDcmS', 11, 'https://skillhub.cn/skills/multi-search-engine', NULL, NULL, '免费', '入门', '["搜索", "API"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Obsidian', 'skillhub-obsidian', '操作 Obsidian 仓库（纯 Markdown 笔记）并通过 obsidian-cli 自动化。', NULL, 'https://aka.doubaocdn.com/s/ncit1wDcmS', 9, 'https://skillhub.cn/skills/obsidian', NULL, NULL, '免费', '入门', '["自动化", "CLI"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Baidu Search', 'skillhub-baidu-search', '使用百度AI搜索引擎(BDSE)搜索网页，获取实时信息、文档资料或研究主题。', NULL, 'https://aka.doubaocdn.com/s/1UvU1wDcmS', 11, 'https://skillhub.cn/skills/baidu-search', NULL, NULL, '免费', '入门', '["浏览器", "搜索"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('AdMapix', 'skillhub-admapix', '该技能数据来源于 ClawHub，作者是 fly0pants，详情可查看', NULL, 'https://aka.doubaocdn.com/s/vDzQ1wDcmS', 10, 'https://skillhub.cn/skills/admapix', NULL, NULL, '免费', '入门', '["API"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Nano Pdf', 'skillhub-nano-pdf', '使用nano-pdf CLI通过自然语言指令编辑PDF', NULL, 'https://aka.doubaocdn.com/s/4C4M1wDcmT', 9, 'https://skillhub.cn/skills/nano-pdf', NULL, NULL, '免费', '入门', '["CLI"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('API Gateway', 'skillhub-api-gateway', '通过托管 OAuth 连接 100 多个 API（如 Google Workspace、Microsoft 365、GitHub、Notion、Slack、Airtable、HubSpot 等）。当用户想要...', NULL, 'https://aka.doubaocdn.com/s/WhNv1wDcmT', 10, 'https://skillhub.cn/skills/api-gateway', NULL, NULL, '免费', '入门', '["Git", "API"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Notion', 'skillhub-notion', '用于创建和管理页面、数据库及块的 Notion API。', NULL, 'https://aka.doubaocdn.com/s/CeUX1wDcmT', 9, 'https://skillhub.cn/skills/notion', NULL, NULL, '免费', '入门', '["API"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Auto-Updater Skill', 'skillhub-auto-updater', '每日自动更新 Clawdbot 及所有已安装技能。运行 cron 检查更新并应用，同时向用户发送变更摘要。', NULL, 'https://aka.doubaocdn.com/s/bRE71wDcmT', 9, 'https://skillhub.cn/skills/auto-updater', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, false, true, 0, 0, NOW(), NOW()),
('Skill Creator', 'skillhub-skill-creator', '创建有效技能指南。当用户希望创建新技能（或更新现有技能）以利用专业知识、工作流程或工具集成扩展 Claude 的能力时，应使用此技能。', NULL, 'https://aka.doubaocdn.com/s/T6nq1wDcmT', 9, 'https://skillhub.cn/skills/skill-creator', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, false, true, 0, 0, NOW(), NOW()),
('Openai Whisper', 'skillhub-openai-whisper', '使用 Whisper CLI 进行本地语音转文字（无需 API 密钥）', NULL, 'https://aka.doubaocdn.com/s/7Z2T1wDcmU', 9, 'https://skillhub.cn/skills/openai-whisper', NULL, NULL, '免费', '入门', '["API", "CLI"]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW());

SELECT '技能数据导入完成:' as msg, COUNT(*) as count FROM skills;

-- ============================================
-- 4. 验证结果
-- ============================================
SELECT '=== 最终数据统计 ===' as msg;
SELECT '工具总数:' as item, COUNT(*) as count FROM tools;
SELECT '技能分类总数:' as item, COUNT(*) as count FROM skill_categories;
SELECT '技能总数:' as item, COUNT(*) as count FROM skills;
SELECT '=== 工具去重完成 ===' as msg;
