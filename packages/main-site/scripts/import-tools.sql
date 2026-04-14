-- ==============================================
-- OneClaw 工具数据导入脚本
-- 在火山引擎 PostgreSQL 控制台执行
-- ==============================================

-- 插入视频生成类工具 (category_id = 1)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('Sora', 'https://www.oneclaw.shop/logos/sora.png', 'OpenAI', '文生视频的革命性突破', 1, '付费工具', ARRAY['文生视频', '图生视频', '长视频'], 'https://openai.com/sora', true, true),
('Runway', 'https://www.oneclaw.shop/logos/runway.png', 'Runway', '专业级AI视频生成', 1, '免费额度', ARRAY['文生视频', '视频编辑', 'AI特效'], 'https://runwayml.com', true, true),
('可灵AI', 'https://www.oneclaw.shop/logos/kling.png', '快手', '国产AI视频生成', 1, '免费额度', ARRAY['文生视频', '图生视频', '支持中文'], 'https://klingai.com', true, true),
('即梦AI', 'https://www.oneclaw.shop/logos/jimeng.png', '字节跳动', '字节系AI创作平台', 1, '免费额度', ARRAY['文生视频', '图生视频', '支持中文'], 'https://jimeng.jianying.com', true, true),
('海螺AI', 'https://www.oneclaw.shop/logos/hailuo.png', 'MiniMax', '国产AI视频生成', 1, '免费额度', ARRAY['文生视频', '图生视频', '数字人'], 'https://hailuoai.video', true, true),
('Pika', 'https://www.oneclaw.shop/logos/pika.png', 'Pika Labs', '简洁易用的AI视频', 1, '免费额度', ARRAY['文生视频', '图生视频', '短视频'], 'https://pika.art', false, true),
('Luma Dream Machine', 'https://www.oneclaw.shop/logos/luma.png', 'Luma AI', '高质量AI视频生成', 1, '免费额度', ARRAY['文生视频', '图生视频', '3D'], 'https://lumalabs.ai', false, true),
('Vidu', 'https://www.oneclaw.shop/logos/vidu.png', '生数科技', '国产多模态AI视频', 1, '免费额度', ARRAY['文生视频', '图生视频', '支持中文'], 'https://vidu.studio', false, true),
('智谱清影', 'https://www.oneclaw.shop/logos/cogview.png', '智谱AI', '国产AI视频生成', 1, '完全免费', ARRAY['文生视频', '图生视频', '支持中文'], 'https://chatglm.cn', false, true),
('PixVerse', 'https://www.oneclaw.shop/logos/pixverse.png', 'PixVerse', 'AI视频生成平台', 1, '免费额度', ARRAY['文生视频', '视频特效'], 'https://pixverse.ai', false, true)
ON CONFLICT DO NOTHING;

-- 插入数字人类工具 (category_id = 2)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('HeyGen', 'https://www.oneclaw.shop/logos/heygen.png', 'HeyGen', '最受欢迎的AI数字人', 2, '免费额度', ARRAY['数字人口播', '多语言', '模板丰富'], 'https://heygen.com', true, true),
('D-ID', 'https://www.oneclaw.shop/logos/did.png', 'D-ID', '数字人视频生成', 2, '免费额度', ARRAY['数字人口播', '照片驱动', 'API支持'], 'https://d-id.com', true, true),
('Synthesia', 'https://www.oneclaw.shop/logos/synthesia.png', 'Synthesia', '企业级AI数字人', 2, '付费工具', ARRAY['数字人口播', '企业培训', '多语言'], 'https://synthesia.io', true, true),
('腾讯智影', 'https://www.oneclaw.shop/logos/zhen.png', '腾讯', '腾讯系AI数字人', 2, '免费额度', ARRAY['数字人口播', '支持中文', '模板丰富'], 'https://zhenru.qq.com', false, true),
('万兴播爆', 'https://www.oneclaw.shop/logos/wondershare.png', '万兴科技', '国产数字人平台', 2, '免费额度', ARRAY['数字人口播', '电商带货', '支持中文'], 'https://virbo.wondershare.cn', false, true),
('硅基智能', 'https://www.oneclaw.shop/logos/guiji.png', '硅基智能', '国内数字人技术领先', 2, '付费工具', ARRAY['数字人口播', '声音克隆', '企业服务'], 'https://carbonai.cn', false, true),
('讯飞智作', 'https://www.oneclaw.shop/logos/xunfei.png', '科大讯飞', '讯飞AI数字人', 2, '免费额度', ARRAY['数字人口播', '声音克隆', '支持中文'], 'https://zhizuo.xunfei.cn', false, true)
ON CONFLICT DO NOTHING;

-- 插入视频编辑类工具 (category_id = 3)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('剪映', 'https://www.oneclaw.shop/logos/jianying.png', '字节跳动', '国民级视频编辑', 3, '完全免费', ARRAY['视频剪辑', 'AI特效', '支持中文'], 'https://jianying.com', true, true),
('CapCut', 'https://www.oneclaw.shop/logos/capcut.png', '字节跳动', '海外版剪映', 3, '完全免费', ARRAY['视频剪辑', 'AI特效', '社交媒体'], 'https://capcut.com', true, true),
('Runway ML', 'https://www.oneclaw.shop/logos/runway.png', 'Runway', 'AI视频编辑先驱', 3, '免费额度', ARRAY['视频编辑', 'AI特效', '绿幕'], 'https://runwayml.com', true, true),
('快影', 'https://www.oneclaw.shop/logos/kuaiying.png', '快手', '快手视频编辑', 3, '完全免费', ARRAY['视频剪辑', 'AI特效', '支持中文'], 'https://kuaishou.com', false, true)
ON CONFLICT DO NOTHING;

-- 插入AI绘画类工具 (category_id = 4)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('Midjourney', 'https://www.oneclaw.shop/logos/midjourney.png', 'Midjourney', 'AI绘画天花板', 4, '付费工具', ARRAY['文生图', '图生图', '4K'], 'https://midjourney.com', true, true),
('DALL·E 3', 'https://www.oneclaw.shop/logos/dalle.png', 'OpenAI', 'ChatGPT内置AI绘画', 4, '付费工具', ARRAY['文生图', '图生图', '支持中文'], 'https://openai.com/dall-e-3', true, true),
('Stable Diffusion', 'https://www.oneclaw.shop/logos/sd.png', 'Stability AI', '开源AI绘画模型', 4, '完全免费', ARRAY['文生图', '本地部署', '开源'], 'https://stability.ai', true, true),
('Adobe Firefly', 'https://www.oneclaw.shop/logos/firefly.png', 'Adobe', 'Adobe AI绘画', 4, '免费额度', ARRAY['文生图', 'PS集成', '商用安全'], 'https://adobe.com/firefly', true, true),
('通义万相', 'https://www.oneclaw.shop/logos/tongyi.png', '阿里云', '阿里AI绘画', 4, '免费额度', ARRAY['文生图', '支持中文', '风格多样'], 'https://tongyi.aliyun.com', false, true),
('文心一格', 'https://www.oneclaw.shop/logos/wenxin.png', '百度', '百度AI绘画', 4, '免费额度', ARRAY['文生图', '支持中文', '国风'], 'https://yige.baidu.com', false, true)
ON CONFLICT DO NOTHING;

-- 插入AI聊天类工具 (category_id = 5)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('ChatGPT', 'https://www.oneclaw.shop/logos/chatgpt.png', 'OpenAI', '全球最流行AI助手', 5, '免费额度', ARRAY['对话', '写作', '编程'], 'https://chat.openai.com', true, true),
('Claude', 'https://www.oneclaw.shop/logos/claude.png', 'Anthropic', '安全可靠的AI助手', 5, '免费额度', ARRAY['对话', '写作', '分析'], 'https://claude.ai', true, true),
('Kimi', 'https://www.oneclaw.shop/logos/kimi.png', '月之暗面', '国产AI助手新星', 5, '完全免费', ARRAY['对话', '长文本', '支持中文'], 'https://kimi.moonshot.cn', true, true),
('豆包', 'https://www.oneclaw.shop/logos/doubao.png', '字节跳动', '字节系AI助手', 5, '完全免费', ARRAY['对话', '支持中文', '智能体'], 'https://doubao.cn', true, true),
('通义千问', 'https://www.oneclaw.shop/logos/qwen.png', '阿里云', '阿里大模型', 5, '完全免费', ARRAY['对话', '支持中文', '编程'], 'https://tongyi.aliyun.com/qianwen', false, true),
('文心一言', 'https://www.oneclaw.shop/logos/wenxinanyiyan.png', '百度', '百度大模型', 5, '免费额度', ARRAY['对话', '支持中文', '知识问答'], 'https://yiyan.baidu.com', false, true),
('讯飞星火', 'https://www.oneclaw.shop/logos/xunfei.png', '科大讯飞', '讯飞大模型', 5, '免费额度', ARRAY['对话', '支持中文', '语音交互'], 'https://xinghuo.xfyun.cn', false, true)
ON CONFLICT DO NOTHING;

-- 插入AI配音类工具 (category_id = 6)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('ElevenLabs', 'https://www.oneclaw.shop/logos/elevenlabs.png', 'ElevenLabs', '最逼真的AI配音', 6, '免费额度', ARRAY['文字转语音', '声音克隆', '多语言'], 'https://elevenlabs.io', true, true),
('讯飞配音', 'https://www.oneclaw.shop/logos/xunfei.png', '科大讯飞', '国产AI配音首选', 6, '免费额度', ARRAY['文字转语音', '支持中文', '多种音色'], 'https://peiyin.xunfei.cn', true, true),
('微软Azure语音', 'https://www.oneclaw.shop/logos/azure.png', '微软', '微软云AI语音', 6, '免费额度', ARRAY['文字转语音', '声音克隆', '多语言'], 'https://azure.microsoft.com/services/cognitive-services/speech-services', false, true),
('剪映配音', 'https://www.oneclaw.shop/logos/jianying.png', '字节跳动', '剪映内置配音', 6, '完全免费', ARRAY['文字转语音', '支持中文', '一键生成'], 'https://jianying.com', false, true)
ON CONFLICT DO NOTHING;

-- 插入AI写作类工具 (category_id = 7)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('Notion AI', 'https://www.oneclaw.shop/logos/notion.png', 'Notion', '笔记软件AI助手', 7, '付费工具', ARRAY['写作辅助', '总结归纳', '头脑风暴'], 'https://notion.so', true, true),
('秘塔写作猫', 'https://www.oneclaw.shop/logos/xiezuocat.png', '秘塔科技', '国产AI写作工具', 7, '免费额度', ARRAY['写作辅助', '错别字检查', '支持中文'], 'https://xiezuocat.com', true, true),
('Jasper', 'https://www.oneclaw.shop/logos/jasper.png', 'Jasper', '企业级AI写作', 7, '付费工具', ARRAY['营销写作', 'SEO优化', '多语言'], 'https://jasper.ai', false, true),
('Copy.ai', 'https://www.oneclaw.shop/logos/copyai.png', 'Copy.ai', 'AI文案生成', 7, '免费额度', ARRAY['文案生成', '营销写作'], 'https://copy.ai', false, true),
('讯飞听见', 'https://www.oneclaw.shop/logos/xunfei.png', '科大讯飞', '语音转文字', 7, '免费额度', ARRAY['语音转文字', '会议记录', '支持中文'], 'https://tingting.cn', false, true)
ON CONFLICT DO NOTHING;

-- 插入AI编程类工具 (category_id = 8)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('GitHub Copilot', 'https://www.oneclaw.shop/logos/copilot.png', 'GitHub', '代码补全神器', 8, '付费工具', ARRAY['代码补全', '多语言', 'IDE集成'], 'https://github.com/features/copilot', true, true),
('Cursor', 'https://www.oneclaw.shop/logos/cursor.png', 'Cursor', 'AI代码编辑器', 8, '免费额度', ARRAY['代码补全', '对话编程', '支持中文'], 'https://cursor.sh', true, true),
('通义灵码', 'https://www.oneclaw.shop/logos/lingma.png', '阿里云', '阿里AI编程助手', 8, '完全免费', ARRAY['代码补全', '支持中文', '免费使用'], 'https://tongyi.aliyun.com/lingma', true, true),
('CodeWhisperer', 'https://www.oneclaw.shop/logos/codewhisperer.png', 'AWS', '亚马逊AI编程', 8, '免费额度', ARRAY['代码补全', '安全扫描', '多语言'], 'https://aws.amazon.com/codewhisperer', false, true),
('CodeRabbit', 'https://www.oneclaw.shop/logos/coderabbit.png', 'CodeRabbit', 'AI代码审查', 8, '免费额度', ARRAY['代码审查', 'PR描述', '多语言'], 'https://coderabbit.ai', false, true)
ON CONFLICT DO NOTHING;

-- 插入AI音频类工具 (category_id = 9)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('Suno', 'https://www.oneclaw.shop/logos/suno.png', 'Suno AI', 'AI音乐生成', 9, '免费额度', ARRAY['音乐生成', '词曲创作', '多风格'], 'https://suno.ai', true, true),
('Udio', 'https://www.oneclaw.shop/logos/udio.png', 'Udio', 'AI音乐创作', 9, '免费额度', ARRAY['音乐生成', '音乐创作'], 'https://udio.com', true, true),
('Mubert', 'https://www.oneclaw.shop/logos/mubert.png', 'Mubert', 'AI背景音乐', 9, '免费额度', ARRAY['背景音乐', '版权安全', '商业使用'], 'https://mubert.com', false, true)
ON CONFLICT DO NOTHING;

-- 插入AI办公类工具 (category_id = 10)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('Gamma', 'https://www.oneclaw.shop/logos/gamma.png', 'Gamma', 'AI演示文稿', 10, '免费额度', ARRAY['PPT生成', '演示文稿', '模板丰富'], 'https://gamma.app', true, true),
('Beautiful.ai', 'https://www.oneclaw.shop/logos/beautifulai.png', 'Beautiful.ai', '智能PPT设计', 10, '免费额度', ARRAY['PPT生成', '自动排版'], 'https://beautiful.ai', false, true),
('飞书妙记', 'https://www.oneclaw.shop/logos/feishu.png', '字节跳动', '会议记录AI', 10, '完全免费', ARRAY['会议记录', '语音转文字', '支持中文'], 'https://feishu.cn', false, true)
ON CONFLICT DO NOTHING;

-- 插入AI搜索类工具 (category_id = 11)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('Perplexity', 'https://www.oneclaw.shop/logos/perplexity.png', 'Perplexity', 'AI搜索引擎', 11, '免费额度', ARRAY['AI搜索', '实时信息', '来源引用'], 'https://perplexity.ai', true, true),
('秘塔AI搜索', 'https://www.oneclaw.shop/logos/metaso.png', '秘塔科技', '国产AI搜索', 11, '完全免费', ARRAY['AI搜索', '支持中文', '无广告'], 'https://metaso.cn', true, true),
('天工AI', 'https://www.oneclaw.shop/logos/tiangong.png', '昆仑万维', '国产AI搜索助手', 11, '完全免费', ARRAY['AI搜索', '对话助手', '支持中文'], 'https://tiangong.cn', false, true)
ON CONFLICT DO NOTHING;

-- 插入AI营销类工具 (category_id = 12)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('Jasper Marketing', 'https://www.oneclaw.shop/logos/jasper.png', 'Jasper', 'AI营销内容', 12, '付费工具', ARRAY['营销写作', 'SEO优化', '社交媒体'], 'https://jasper.ai', false, true),
('Copy.ai', 'https://www.oneclaw.shop/logos/copyai.png', 'Copy.ai', 'AI文案工具', 12, '免费额度', ARRAY['文案生成', '营销写作'], 'https://copy.ai', false, true)
ON CONFLICT DO NOTHING;

-- 插入AI学习类工具 (category_id = 13)
INSERT INTO tools (name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, is_featured, is_active) VALUES
('Duolingo', 'https://www.oneclaw.shop/logos/duolingo.png', 'Duolingo', 'AI语言学习', 13, '完全免费', ARRAY['语言学习', '游戏化', '多语言'], 'https://duolingo.com', true, true),
('Speak', 'https://www.oneclaw.shop/logos/speak.png', 'Speak', 'AI口语教练', 13, '付费工具', ARRAY['口语练习', 'AI对话', '纠错反馈'], 'https://speak.com', true, true)
ON CONFLICT DO NOTHING;

-- ==============================================
-- 验证导入结果
-- ==============================================
SELECT 
    c.name as category,
    COUNT(t.id) as tool_count
FROM categories c
LEFT JOIN tools t ON t.category_id = c.id AND t.is_active = true
GROUP BY c.id, c.name
ORDER BY c.sort_order;
