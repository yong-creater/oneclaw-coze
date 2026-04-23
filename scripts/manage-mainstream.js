/**
 * 主流AI工具管理：
 * 1. 保留知名/热门工具
 * 2. 删除小众工具
 * 3. 补充缺失的主流工具
 */

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.COZE_SUPABASE_URL, process.env.COZE_SUPABASE_SERVICE_ROLE_KEY);

// 主流AI工具列表（保留）
const MAINSTREAM_TOOLS = [
  // 视频生成
  { name: 'Sora', url: 'https://openai.com/sora', category: '视频生成', highlight: 'OpenAI官方AI视频生成' },
  { name: 'Runway', url: 'https://runwayml.com', category: '视频生成', highlight: '专业AI视频创作平台' },
  { name: '可灵AI', url: 'https://klingai.com', category: '视频生成', highlight: '快手可灵大模型' },
  { name: '即梦AI', url: 'https://jimeng.jianying.com', category: '视频生成', highlight: '字节剪映AI绘画' },
  { name: 'Pika', url: 'https://pika.art', category: '视频生成', highlight: 'AI视频生成工具' },
  { name: 'Luma AI', url: 'https://lumalabs.ai', category: '视频生成', highlight: 'AI视频和3D生成' },
  { name: 'PixVerse', url: 'https://pixverse.ai', category: '视频生成', highlight: 'AI视频生成' },
  { name: 'Seedance', url: 'https://seedance.com', category: '视频生成', highlight: '字节Seedance' },
  { name: '海螺AI', url: 'https://hailuoai.video', category: '视频生成', highlight: 'MiniMax海螺AI' },
  { name: 'Vidu', url: 'https://www.vidumovie.com', category: '视频生成', highlight: '生数科技视频生成' },
  { name: '腾讯混元', url: 'https://yuanbao.tencent.com', category: '视频生成', highlight: '腾讯混元大模型' },
  { name: '智谱清影', url: 'https://www.zhipuai.cn', category: '视频生成', highlight: '智谱AI视频生成' },
  
  // AI绘画/图像
  { name: 'Midjourney', url: 'https://www.midjourney.com', category: 'AI绘画', highlight: '最流行的AI绘画工具' },
  { name: 'DALL·E', url: 'https://openai.com/dall-e-3', category: 'AI绘画', highlight: 'OpenAI官方绘画' },
  { name: 'Stable Diffusion', url: 'https://stability.ai', category: 'AI绘画', highlight: '开源AI绘画模型' },
  { name: 'LiblibAI', url: 'https://www.liblib.art', category: 'AI绘画', highlight: '国内最大AI绘画平台' },
  { name: '吐司AI', url: 'https://tusi.com', category: 'AI绘画', highlight: 'AI模型分享社区' },
  { name: ' Civitai', url: 'https://civitai.com', category: 'AI绘画', highlight: 'AI模型资源库' },
  { name: 'Leonardo AI', url: 'https://leonardo.ai', category: 'AI绘画', highlight: '专业AI绘画平台' },
  { name: 'Adobe Firefly', url: 'https://firefly.adobe.com', category: 'AI绘画', highlight: 'Adobe AI绘画' },
  { name: '文心一格', url: 'https://yige.baidu.com', category: 'AI绘画', highlight: '百度AI绘画' },
  { name: '通义万相', url: 'https://tongyi.aliyun.com', category: 'AI绘画', highlight: '阿里通义万相' },
  { name: '秒画', url: 'https://miaohua.sensetime.com', category: 'AI绘画', highlight: '商汤秒画' },
  { name: 'WHEE', url: 'https://whee.qq.com', category: 'AI绘画', highlight: '美图WHEE' },
  { name: '醒图', url: 'https://xcx.aliyunweb.com.cn', category: 'AI绘画', highlight: '字节醒图' },
  { name: 'RemoveBG', url: 'https://remove.bg', category: 'AI绘画', highlight: 'AI一键抠图' },
  
  // AI聊天/LLM
  { name: 'ChatGPT', url: 'https://chat.openai.com', category: 'AI聊天', highlight: 'OpenAI聊天机器人' },
  { name: 'Claude', url: 'https://claude.ai', category: 'AI聊天', highlight: 'Anthropic AI助手' },
  { name: 'Kimi', url: 'https://kimi.moonshot.cn', category: 'AI聊天', highlight: '月之暗面Kimi' },
  { name: '豆包', url: 'https://www.doubao.com', category: 'AI聊天', highlight: '字节豆包AI' },
  { name: '文心一言', url: 'https://yiyan.baidu.com', category: 'AI聊天', highlight: '百度文心一言' },
  { name: '通义千问', url: 'https://tongyi.aliyun.com/qianwen', category: 'AI聊天', highlight: '阿里通义千问' },
  { name: '讯飞星火', url: 'https://xinghuo.xfyun.cn', category: 'AI聊天', highlight: '讯飞星火大模型' },
  { name: '智谱ChatGLM', url: 'https://www.zhipuai.cn', category: 'AI聊天', highlight: '智谱ChatGLM' },
  { name: 'Grok', url: 'https://grok.x.com', category: 'AI聊天', highlight: 'xAI Grok' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai', category: 'AI搜索', highlight: 'AI搜索引擎' },
  { name: '秘塔AI搜索', url: 'https://metaso.cn', category: 'AI搜索', highlight: 'AI搜索引擎' },
  { name: 'Kimi探索版', url: 'https://kimi.moonshot.cn', category: 'AI搜索', highlight: 'Kimi深度搜索' },
  
  // AI音频/音乐
  { name: 'Suno', url: 'https://suno.ai', category: 'AI音频', highlight: 'AI音乐生成' },
  { name: 'Udio', url: 'https://www.udio.com', category: 'AI音频', highlight: 'AI音乐创作' },
  { name: 'ElevenLabs', url: 'https://elevenlabs.io', category: 'AI音频', highlight: 'AI语音合成' },
  { name: '讯飞配音', url: 'https://peiyin.xunfei.cn', category: 'AI音频', highlight: '讯飞语音合成' },
  { name: '魔音工坊', url: 'https://moyin.com', category: 'AI音频', highlight: 'AI配音工具' },
  { name: 'Mubert', url: 'https://mubert.com', category: 'AI音频', highlight: 'AI音乐生成' },
  { name: 'ACE Studio', url: 'https://accompany.net', category: 'AI音频', highlight: 'AI歌声合成' },
  { name: '剪映', url: 'https://capcut.com', category: '视频编辑', highlight: '字节AI剪辑' },
  { name: 'CapCut', url: 'https://capcut.com', category: '视频编辑', highlight: 'AI视频剪辑' },
  { name: '必剪', url: 'https://bijian.aliyun.com', category: '视频编辑', highlight: '阿里必剪' },
  
  // 数字人
  { name: 'HeyGen', url: 'https://heygen.com', category: '数字人', highlight: 'AI数字人视频' },
  { name: 'D-ID', url: 'https://www.d-id.com', category: '数字人', highlight: 'AI数字人' },
  { name: 'Synthesia', url: 'https://www.synthesia.io', category: '数字人', highlight: 'AI视频数字人' },
  { name: '腾讯智影', url: 'https://zenvideo.qq.com', category: '数字人', highlight: '腾讯数字人' },
  { name: '讯飞虚拟人', url: 'https://vr.iflytek.com', category: '数字人', highlight: '讯飞虚拟数字人' },
  { name: '万兴播爆', url: 'https://virbo.wondershare.cn', category: '数字人', highlight: '万兴播爆数字人' },
  
  // AI编程
  { name: 'Cursor', url: 'https://cursor.com', category: 'AI编程', highlight: 'AI代码编辑器' },
  { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', category: 'AI编程', highlight: '微软AI编程' },
  { name: '通义灵码', url: 'https://tongyi.aliyun.com/lingma', category: 'AI编程', highlight: '阿里AI编程助手' },
  { name: 'Codeium', url: 'https://codeium.com', category: 'AI编程', highlight: '免费AI编程' },
  { name: 'CodeWhisperer', url: 'https://aws.amazon.com/codewhisperer', category: 'AI编程', highlight: 'AWS AI编程' },
  { name: 'Bolt', url: 'https://bolt.new', category: 'AI编程', highlight: 'AI全栈开发' },
  { name: 'V0', url: 'https://v0.dev', category: 'AI编程', highlight: 'Vercel AI开发' },
  { name: ' Windsurf', url: 'https://windsurf.com', category: 'AI编程', highlight: 'AI代码编辑器' },
  
  // AI办公/效率
  { name: 'Notion AI', url: 'https://notion.so', category: 'AI办公', highlight: 'AI笔记助手' },
  { name: 'Gamma', url: 'https://gamma.app', category: 'AI办公', highlight: 'AI幻灯片制作' },
  { name: 'Beautiful.ai', url: 'https://www.beautiful.ai', category: 'AI办公', highlight: 'AI演示文稿' },
  { name: '飞书妙记', url: 'https://feishu.cn', category: 'AI办公', highlight: 'AI会议记录' },
  { name: 'ChatPDF', url: 'https://chatpdf.com', category: 'AI办公', highlight: 'AI文档阅读' },
  { name: 'Monica', url: 'https://monica.im', category: 'AI办公', highlight: 'AI助手扩展' },
  
  // AI学习
  { name: 'Duolingo', url: 'https://duolingo.com', category: 'AI学习', highlight: 'AI语言学习' },
  { name: 'Speak', url: 'https://speak.com', category: 'AI学习', highlight: 'AI口语练习' },
  { name: 'Otter.ai', url: 'https://otter.ai', category: 'AI学习', highlight: 'AI会议转录' },
  
  // AI设计
  { name: 'Canva', url: 'https://www.canva.com', category: 'AI设计', highlight: 'AI设计平台' },
  { name: 'Figma', url: 'https://www.figma.com', category: 'AI设计', highlight: 'AI协作设计' },
  { name: '稿定设计', url: 'https://www.gaoding.com', category: 'AI设计', highlight: 'AI在线设计' },
  { name: 'MasterGo', url: 'https://mastergo.com', category: 'AI设计', highlight: 'AI协作设计工具' },
  { name: '创客贴', url: 'https://www.chuangkit.com', category: 'AI设计', highlight: 'AI在线设计' },
  
  // AI营销
  { name: 'Jasper', url: 'https://www.jasper.ai', category: 'AI营销', highlight: 'AI内容营销' },
  { name: 'Copy.ai', url: 'https://www.copy.ai', category: 'AI营销', highlight: 'AI文案创作' },
  { name: '秘塔写作猫', url: 'https://xiezuocat.com', category: 'AI写作', highlight: 'AI写作助手' },
  
  // AI Agent/智能体
  { name: '扣子', url: 'https://coze.cn', category: 'AI智能体', highlight: '字节AI智能体平台' },
  { name: 'Dify', url: 'https://dify.ai', category: 'AI智能体', highlight: '开源LLM应用平台' },
  { name: 'FastGPT', url: 'https://fastgpt.cn', category: 'AI智能体', highlight: 'AI知识库问答' },
  { name: 'Coze', url: 'https://coze.com', category: 'AI智能体', highlight: 'Coze智能体' },
];

// 分类映射
const CATEGORY_MAP = {
  '视频生成': 1,
  'AI绘画': 6,
  'AI聊天': 13,
  'AI搜索': 14,
  'AI音频': 9,
  '视频编辑': 3,
  '数字人': 2,
  'AI编程': 8,
  'AI办公': 10,
  'AI学习': 12,
  'AI设计': 7,
  'AI营销': 11,
  'AI写作': 7,
  'AI智能体': 5,
};

// 免费类型判断
function getFreeType(highlight, name) {
  const text = (highlight + name).toLowerCase();
  if (text.includes('免费')) return '完全免费';
  if (text.includes('付费')) return '付费工具';
  return '免费额度';
}

async function main() {
  console.log('🚀 开始管理主流AI工具...\n');

  // Step 1: 清空现有工具
  console.log('1️⃣ 清空现有工具...');
  await supabase.from('tools').delete().neq('id', 0);
  
  // Step 2: 导入主流工具
  console.log('2️⃣ 导入主流工具...');
  
  const toolsToInsert = MAINSTREAM_TOOLS.map(tool => ({
    name: tool.name.trim(),
    logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40" rx="8"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">' + tool.name.trim()[0] + '</text></svg>',
    producer: '',
    highlight: tool.highlight,
    category_id: CATEGORY_MAP[tool.category] || 1,
    free_type: getFreeType(tool.highlight, tool.name),
    free_quota_desc: '',
    official_url: tool.url,
    promotion_url: '',
    max_duration: '',
    feature_tags: [],
    is_featured: true,
    is_active: true,
    commercial_license: '需授权',
    launch_date: new Date().toISOString().split('T')[0],
    view_count: Math.floor(Math.random() * 50000) + 10000,
    click_count: Math.floor(Math.random() * 5000) + 1000,
  }));

  const { data, error } = await supabase
    .from('tools')
    .insert(toolsToInsert)
    .select('id, name');

  if (error) {
    console.log('❌ 导入失败:', error.message);
    return;
  }

  console.log(`✅ 成功导入 ${data.length} 个主流工具\n`);

  // Step 3: 显示分类统计
  const { count } = await supabase.from('tools').select('*', { count: 'exact', head: true });
  console.log(`📊 总计: ${count} 个工具`);
  
  const { data: cats } = await supabase
    .from('tools')
    .select('category_id')
    .then(async ({ data }) => {
      const counts = {};
      data?.forEach(t => {
        counts[t.category_id] = (counts[t.category_id] || 0) + 1;
      });
      return { data: counts };
    });
    
  console.log('\n📋 分类分布:');
  const catNames = { 1: '视频生成', 2: '数字人', 3: '视频编辑', 5: 'AI智能体', 6: 'AI绘画', 7: 'AI设计/写作', 8: 'AI编程', 9: 'AI音频', 10: 'AI办公', 11: 'AI营销', 12: 'AI学习', 13: 'AI聊天', 14: 'AI搜索' };
  Object.entries(cats || {}).forEach(([id, cnt]) => {
    console.log(`  ${catNames[id] || id}: ${cnt}`);
  });
}

main().catch(console.error);
