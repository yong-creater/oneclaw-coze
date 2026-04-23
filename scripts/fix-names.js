/**
 * 进一步修复工具名称
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.COZE_SUPABASE_URL, process.env.COZE_SUPABASE_SERVICE_ROLE_KEY);

// 更完整的映射
const NAME_MAP = {
  'play.ht': 'Play.ht',
  'elevenlabs.io': 'ElevenLabs',
  'mubert.com': 'Mubert',
  'suno.ai': 'Suno AI',
  'udio.com': 'Udio',
  'otter.ai': 'Otter.ai',
  'capcut.com': 'CapCut',
  'runwayml.com': 'Runway',
  'openai.com': 'ChatGPT',
  'anthropic.com': 'Claude',
  'kimi.moonshot.cn': 'Kimi',
  'doubao.com': '豆包',
  'midjourney.com': 'Midjourney',
  'stability.ai': 'Stable Diffusion',
  'liblib.tv': 'LiblibAI',
  'liblib.art': 'LiblibAI',
  'heygen.com': 'HeyGen',
  'synthesia.io': 'Synthesia',
  'd-id.com': 'D-ID',
  'cursor.com': 'Cursor',
  'copilot.github.com': 'GitHub Copilot',
  'tongyi.aliyun.com': '通义千问',
  'minimax.io': 'MiniMax',
  'klingai.com': '可灵AI',
  'kling.kuaishou.com': '可灵AI',
  'jimeng.jianying.com': '即梦AI',
  'seedance.com': 'Seedance',
  'pika.art': 'Pika',
  'lumalabs.ai': 'Luma AI',
  'kuaishou.com': '快手',
  'tencent.com': '腾讯',
  'baidu.com': '文心一言',
  'byte.com': '豆包',
  'xunfei.cn': '讯飞',
  'peiyin.xunfei.cn': '讯飞配音',
  'iflyrec.com': '讯飞听见',
  'yizhi.iflyrec.com': '讯飞听见',
  'y.qq.com': 'QQ音乐',
  'haimian.com': '海螺AI',
  'moyin.com': '魔音工坊',
  'lovo.ai': 'LOVO AI',
  'tunee.ai': 'Tunee',
  'github.com': 'GitHub',
  'figma.com': 'Figma',
  'notion.so': 'Notion',
  'canva': 'Canva',
  'gaoding.com': '稿定设计',
  'remove.bg': 'RemoveBG',
  'leonardo.ai': 'Leonardo AI',
  '剪映': '剪映',
  '必剪': '必剪',
  '快影': '快影',
  'mastergo.com': 'MasterGo',
  'pixverse': 'PixVerse',
  'pixai': 'PixAI',
  'seaart': 'SeaArt',
  'tusi': '吐司AI',
  'chatbox': 'Chatbox',
  'cherry': 'Cherry Studio',
  'dify': 'Dify',
  'coze': '扣子',
  'fastgpt': 'FastGPT',
  'ima': 'ima知识库',
  'civitai.com': 'Civitai',
  'whee.com': 'WHEE',
  'miaohua': '妙画',
  'sensetime.com': '商汤秒画',
  'ihuiwa': '绘蛙',
  'youyan3d': '有颜3D',
  'xingyun3d': '星云3D',
  'joypix': 'Joypix',
  'd.design': '堆友',
  'soundviewai': '声视AI',
  'chanjing': '蝉镜',
  'fas.st': 'Fas',
  'abeiai': 'Abeiai',
  'runninghub': 'RunningHub',
  'douge.com': '斗哥AI',
  'yinshu.me': '音书',
  'nafy.ai': 'Nafy',
  'turboscribe': 'Turboscribe',
  'dwsj.cn': '多维时空',
  'qx.utiliverse': 'QX AI',
  'notebooklm.google': 'NotebookLM',
  'kai': '凯',
};

// 从URL提取名称
function extractNameFromUrl(url) {
  if (!url) return null;
  
  try {
    const hostname = new URL(url).hostname.replace('www.', '').toLowerCase();
    const pathname = new URL(url).pathname.toLowerCase();
    
    // 检查已知映射
    const sortedKeys = Object.keys(NAME_MAP).sort((a, b) => b.length - a.length);
    
    for (const key of sortedKeys) {
      if (hostname.includes(key.toLowerCase()) || pathname.includes(key.toLowerCase())) {
        return NAME_MAP[key];
      }
    }
    
    // 提取域名第一部分
    const parts = hostname.split('.');
    const rawName = parts[0];
    
    // 过滤掉无效名称
    if (rawName.length < 3 || ['utm', 'ai', 'bot', 'cn', 'com', 'io'].includes(rawName.toLowerCase())) {
      return null;
    }
    
    // 格式化
    return rawName
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  } catch {
    return null;
  }
}

async function main() {
  console.log('🚀 修复工具名称...\n');

  const { data: tools } = await supabase.from('tools').select('id, name, official_url');
  console.log(`📊 ${tools.length} 个工具`);

  let updated = 0;

  for (const tool of tools) {
    const newName = extractNameFromUrl(tool.official_url);
    
    if (newName && newName !== tool.name) {
      await supabase.from('tools').update({ name: newName }).eq('id', tool.id);
      updated++;
      process.stdout.write('.');
    }
  }

  console.log(`\n\n✅ 更新 ${updated} 个`);
}

main().catch(console.error);
