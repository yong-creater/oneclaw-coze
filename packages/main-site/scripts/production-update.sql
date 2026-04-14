-- ============================================
-- OneClaw 生产环境数据更新脚本
-- 执行时间: 2026-04-14
-- ============================================

-- ============================================
-- 1. 工具表去重（按名称去重，保留最优的）
-- 保留规则：优先保留 is_featured=true 的，其次保留 is_active=true 的，最后保留 ID 最小的
-- ============================================

-- 先查看重复情况
SELECT '=== 去重前工具数量 ===' as info, COUNT(*) as count FROM tools;
SELECT name, COUNT(*) as cnt FROM tools GROUP BY name HAVING COUNT(*) > 1 ORDER BY cnt DESC LIMIT 10;

-- 创建临时表保存去重后的ID
CREATE TEMP TABLE tools_to_keep AS
SELECT DISTINCT ON (name) id
FROM tools
ORDER BY name, 
  CASE WHEN is_featured = true THEN 0 ELSE 1 END,
  CASE WHEN is_active = true THEN 0 ELSE 1 END,
  id;

-- 删除不在保留列表中的记录
DELETE FROM tools WHERE id NOT IN (SELECT id FROM tools_to_keep);

-- 清理临时表
DROP TABLE tools_to_keep;

-- 查看去重结果
SELECT '=== 去重后工具数量 ===' as info, COUNT(*) as count FROM tools;
SELECT name, COUNT(*) as cnt FROM tools GROUP BY name HAVING COUNT(*) > 1 LIMIT 10;

-- ============================================
-- 2. 技能分类数据导入
-- ============================================

-- 清空现有技能分类
TRUNCATE TABLE skill_categories RESTART IDENTITY CASCADE;

-- 插入技能分类
INSERT INTO skill_categories (name, slug, description, icon, color, sort_order, is_active, created_at, updated_at) VALUES
('AI', 'ai', 'SkillHub AI 分类，汇聚优质 AI 技能', '🤖', '#8B5CF6', 0, true, NOW(), NOW()),
('智能开发', 'dev', 'SkillHub 智能开发 分类，汇聚优质 AI 技能', '💻', '#3B82F6', 1, true, NOW(), NOW()),
('工具效率', 'tools', 'SkillHub 工具效率 分类，汇聚优质 AI 技能', '⚡', '#10B981', 2, true, NOW(), NOW()),
('数据分析', 'data', 'SkillHub 数据分析 分类，汇聚优质 AI 技能', '📊', '#EC4899', 3, true, NOW(), NOW()),
('提升', 'improve', 'SkillHub 提升 分类，汇聚优质 AI 技能', '📈', '#F59E0B', 4, true, NOW(), NOW()),
('内容创作', 'content', 'SkillHub 内容创作 分类，汇聚优质 AI 技能', '✍️', '#EF4444', 5, true, NOW(), NOW()),
('安全合规', 'security', 'SkillHub 安全合规 分类，汇聚优质 AI 技能', '🔒', '#06B6D4', 6, true, NOW(), NOW()),
('通讯协作', 'communication', 'SkillHub 通讯协作 分类，汇聚优质 AI 技能', '💬', '#F97316', 7, true, NOW(), NOW());

-- ============================================
-- 3. 技能数据导入
-- ============================================

-- 清空现有技能
TRUNCATE TABLE skills RESTART IDENTITY CASCADE;

-- 插入技能数据
INSERT INTO skills (name, slug, description, icon, logo, category_id, official_url, documentation_url, github_url, pricing, difficulty, tags, feature_list, is_featured, is_active, view_count, click_count, created_at, updated_at) VALUES
('self-improving-agent', 'skillhub-self-improving-agent', 'self-improving-agent - 来自 SkillHub 的精选 AI 技能', NULL, NULL, 1, 'https://skillhub.cn/skills/self-improving-agent', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Find Skills', 'skillhub-find-skills', '当用户询问"如何做某事"、"寻找某技能"或希望扩展功能时，帮助发现并安装智能体技能。适用于寻找可安装功能的场景。', NULL, 'https://aka.doubaocdn.com/s/1wvn1wDcmP', 1, 'https://skillhub.cn/skills/find-skills', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, false, true, 0, 0, NOW(), NOW()),
('Summarize', 'skillhub-summarize', '使用summarize CLI总结URL或文件（支持网页、PDF、图片、音频、YouTube）。', NULL, 'https://aka.doubaocdn.com/s/QDZE1wDcmP', 3, 'https://skillhub.cn/skills/summarize', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Agent Browser', 'skillhub-agent-browser', '基于Rust的快速无头浏览器自动化CLI，支持Node.js回退，允许AI代理通过结构化命令执行页面导航、点击、输入和快照操作。', NULL, 'https://aka.doubaocdn.com/s/qnQs1wDcmP', 2, 'https://skillhub.cn/skills/agent-browser', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Self-Improving + Proactive Agent', 'skillhub-self-improving', '自我反思+自我批评+自我学习+自组织记忆。智能体评估自身工作、发现错误并持续改进。', NULL, 'https://aka.doubaocdn.com/s/K1lR1wDcmQ', 1, 'https://skillhub.cn/skills/self-improving', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, false, true, 0, 0, NOW(), NOW()),
('Github', 'skillhub-github', '使用 `gh` CLI 与 GitHub 交互，通过 `gh issue`、`gh pr`、`gh run` 和 `gh api` 管理议题、PR、CI 运行及高级查询。', NULL, 'https://aka.doubaocdn.com/s/jire1wDcmQ', 2, 'https://skillhub.cn/skills/github', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('ontology', 'skillhub-ontology', '类型化知识图谱，用于结构化智能体记忆与可组合技能。支持创建/查询实体（人员、项目、任务、事件、文档）及关联。', NULL, 'https://aka.doubaocdn.com/s/lfnw1wDcmQ', 1, 'https://skillhub.cn/skills/ontology', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Skill Vetter', 'skillhub-skill-vetter', 'AI智能体技能安全预审工具。安装ClawdHub、GitHub等来源技能前，检查风险信号、权限范围及可疑模式。', NULL, 'https://aka.doubaocdn.com/s/s2wt1wDcmQ', 7, 'https://skillhub.cn/skills/skill-vetter', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Proactive Agent', 'skillhub-proactive-agent', '将AI智能体从任务执行者升级为主动预判需求、持续优化的智能伙伴。集成WAL协议、工作缓冲区、自主定时任务及实战验证模式。', NULL, 'https://aka.doubaocdn.com/s/70B91wDcmQ', 1, 'https://skillhub.cn/skills/proactive-agent', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Gog', 'skillhub-gog', 'Google Workspace 命令行工具，支持 Gmail、日历、云端硬盘、通讯录、表格和文档。', NULL, 'https://aka.doubaocdn.com/s/aB5Z1wDcmR', 1, 'https://skillhub.cn/skills/gog', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, false, true, 0, 0, NOW(), NOW()),
('Weather', 'skillhub-weather', '获取当前天气和预报（无需API密钥）', NULL, 'https://aka.doubaocdn.com/s/VSc01wDcmR', 1, 'https://skillhub.cn/skills/weather', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Nano Banana Pro', 'skillhub-nano-banana-pro', '使用 Nano Banana Pro (Gemini 3 Pro Image) 生成或编辑图像。支持文生图、图生图及 1K/2K/4K 分辨率。', NULL, 'https://aka.doubaocdn.com/s/OLQd1wDcmR', 1, 'https://skillhub.cn/skills/nano-banana-pro', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('CodeConductor.ai', 'skillhub-codeconductor', 'AI驱动平台，提供快速全栈开发、智能体、工作流自动化及低代码AI集成的可扩展产品创建。', NULL, 'https://aka.doubaocdn.com/s/e9Cc1wDcmR', 2, 'https://skillhub.cn/skills/codeconductor', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Humanizer', 'skillhub-humanizer', '消除AI写作痕迹，使文本更自然真实。基于维基百科"AI写作特征"指南，识别并修正AI写作常见问题。', NULL, 'https://aka.doubaocdn.com/s/cAag1wDcmS', 6, 'https://skillhub.cn/skills/humanizer', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Multi Search Engine', 'skillhub-multi-search-engine', '集成17个搜索引擎（8国内+9国际），支持高级搜索语法、时间筛选、站内搜索、隐私引擎及WolframAlpha知识查询。', NULL, 'https://aka.doubaocdn.com/s/dOsk1wDcmS', 3, 'https://skillhub.cn/skills/multi-search-engine', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Obsidian', 'skillhub-obsidian', '操作 Obsidian 仓库（纯 Markdown 笔记）并通过 obsidian-cli 自动化。', NULL, 'https://aka.doubaocdn.com/s/ncit1wDcmS', 1, 'https://skillhub.cn/skills/obsidian', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Baidu Search', 'skillhub-baidu-search', '使用百度AI搜索引擎(BDSE)搜索网页，获取实时信息、文档资料或研究主题。', NULL, 'https://aka.doubaocdn.com/s/1UvU1wDcmS', 3, 'https://skillhub.cn/skills/baidu-search', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('AdMapix', 'skillhub-admapix', 'API 集成工具，支持多种广告平台和数据分析功能。', NULL, 'https://aka.doubaocdn.com/s/vDzQ1wDcmS', 2, 'https://skillhub.cn/skills/admapix', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Nano Pdf', 'skillhub-nano-pdf', '使用nano-pdf CLI通过自然语言指令编辑PDF', NULL, 'https://aka.doubaocdn.com/s/4C4M1wDcmT', 1, 'https://skillhub.cn/skills/nano-pdf', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('API Gateway', 'skillhub-api-gateway', '通过托管 OAuth 连接 100 多个 API（如 Google Workspace、Microsoft 365、GitHub、Notion、Slack、Airtable、HubSpot 等）。', NULL, 'https://aka.doubaocdn.com/s/WhNv1wDcmT', 2, 'https://skillhub.cn/skills/api-gateway', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Notion', 'skillhub-notion', '用于创建和管理页面、数据库及块的 Notion API。', NULL, 'https://aka.doubaocdn.com/s/CeUX1wDcmT', 1, 'https://skillhub.cn/skills/notion', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW()),
('Auto-Updater Skill', 'skillhub-auto-updater', '每日自动更新 Clawdbot 及所有已安装技能。运行 cron 检查更新并应用，同时向用户发送变更摘要。', NULL, 'https://aka.doubaocdn.com/s/bRE71wDcmT', 1, 'https://skillhub.cn/skills/auto-updater', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, false, true, 0, 0, NOW(), NOW()),
('Skill Creator', 'skillhub-skill-creator', '创建有效技能指南。当用户希望创建新技能以利用专业知识、工作流程或工具集成扩展 Claude 的能力时，应使用此技能。', NULL, 'https://aka.doubaocdn.com/s/T6nq1wDcmT', 1, 'https://skillhub.cn/skills/skill-creator', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, false, true, 0, 0, NOW(), NOW()),
('Openai Whisper', 'skillhub-openai-whisper', '使用 Whisper CLI 进行本地语音转文字（无需 API 密钥）', NULL, 'https://aka.doubaocdn.com/s/7Z2T1wDcmU', 1, 'https://skillhub.cn/skills/openai-whisper', NULL, NULL, '免费', '入门', '[]'::jsonb, '[]'::jsonb, true, true, 0, 0, NOW(), NOW());

-- ============================================
-- 4. 最终验证
-- ============================================
SELECT '=== 最终数据统计 ===' as info;
SELECT '工具总数:' as item, COUNT(*) as count FROM tools;
SELECT '技能分类总数:' as item, COUNT(*) as count FROM skill_categories;
SELECT '技能总数:' as item, COUNT(*) as count FROM skills;
SELECT '工具重复数:' as item, COUNT(*) as count FROM (SELECT name FROM tools GROUP BY name HAVING COUNT(*) > 1) t;
