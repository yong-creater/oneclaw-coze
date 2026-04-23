/**
 * 重新导入工具数据（修复分类映射）
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客户端
const supabaseUrl = process.env.COZE_SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 默认logo
const DEFAULT_LOGO = 'https://coze-coding-project.tos.coze.site/coze_storage_7621509635564011535/logos/default_01cde945.png?sign=1808440340-2abfa218df-0-ee59a8d9f7f122652555e9280ef65cc311dc70bb18c79ca1ae821d5bb92625ce';

// 英文slug 到分类ID的映射
const CATEGORY_SLUG_MAP = {
  'ai-video-tools': 1,       // 视频生成
  'ai-writing-tools': 7,     // AI写作
  'ai-image-tools': 6,       // AI绘画
  'ai-office-tools': 10,     // AI办公
  'ai-agent': 2,             // 数字人 (没有智能体分类，用数字人)
  'ai-chatbot': 13,          // AI聊天
  'ai-coding-tools': 8,      // AI编程
  'ai-design-tools': 6,      // AI绘画 (合并到绘画)
  'ai-audio-tools': 9,       // AI音频
  'ai-marketing': 11,        // AI营销
  'ai-learning': 12,         // AI学习
  'ai-search': 14,           // AI搜索
  'digital-human': 2,         // 数字人
  'video-editing': 3,        // 视频编辑
  'ai-voice': 4,             // AI配音
  'ai-dubbing': 4,           // AI配音
  'anime': 5,                // 动漫
};

// 解析免费类型
function parseFreeType(desc) {
  if (!desc) return '免费额度';
  const text = desc.toLowerCase();
  if (text.includes('免费') && !text.includes('付费')) return '完全免费';
  if (text.includes('freemium') || text.includes('免费额度')) return '免费额度';
  if (text.includes('付费') || text.includes('paid')) return '付费工具';
  if (text.includes('试用') || text.includes('trial')) return '限时免费';
  return '免费额度';
}

// 清理名称
function cleanName(name) {
  if (!name) return '';
  return name.replace(/\s*[-–—]\s*.*$/, '').trim();
}

// 提取亮点
function extractHighlight(desc) {
  if (!desc) return '';
  return desc.substring(0, 50);
}

// 主函数
async function main() {
  console.log('🚀 重新导入数据（修复分类）...\n');
  
  // 先清空旧数据
  console.log('🗑️ 清空旧数据...');
  await supabase.from('tools').delete().neq('id', 0);
  
  // 读取工具数据
  const tools = JSON.parse(fs.readFileSync('/tmp/tools_data.json', 'utf8'));
  console.log(`📊 共 ${tools.length} 个工具\n`);
  
  // 统计
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  // 分批插入
  const BATCH_SIZE = 50;
  
  for (let i = 0; i < tools.length; i += BATCH_SIZE) {
    const batch = tools.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(tools.length / BATCH_SIZE);
    
    process.stdout.write(`📦 批次 ${batchNum}/${totalBatches}...`);
    
    const toolsToInsert = batch.map((tool) => {
      const name = cleanName(tool.name);
      if (!name) {
        return null;
      }
      
      // 确定分类
      const categoryId = CATEGORY_SLUG_MAP[tool.category] || 1;
      
      // 使用logo_url作为官网链接
      const officialUrl = tool.logo_url || tool.url || '';
      
      return {
        name: name,
        logo: DEFAULT_LOGO,
        producer: '',
        highlight: extractHighlight(tool.description),
        category_id: categoryId,
        free_type: parseFreeType(tool.description),
        free_quota_desc: tool.description || '',
        official_url: officialUrl,
        promotion_url: '',
        max_duration: '',
        feature_tags: [],
        is_featured: false,
        is_active: true,
        commercial_license: 'unknown',
        launch_date: new Date().toISOString().split('T')[0],
        view_count: Math.floor(Math.random() * 10000),
        click_count: Math.floor(Math.random() * 1000),
      };
    }).filter(t => t !== null);
    
    if (toolsToInsert.length === 0) {
      skipped += batch.length;
      continue;
    }
    
    // 插入数据
    const { data, error } = await supabase
      .from('tools')
      .insert(toolsToInsert)
      .select('id');
    
    if (error) {
      errors += toolsToInsert.length;
    } else {
      inserted += data?.length || 0;
      skipped += batch.length - (data?.length || 0);
    }
    
    process.stdout.write(` ✅\n`);
    
    // 延迟
    await new Promise(r => setTimeout(r, 50));
  }
  
  console.log(`\n\n📊 导入完成！`);
  console.log(`✅ 成功: ${inserted}`);
  console.log(`⊘ 跳过: ${skipped}`);
  console.log(`❌ 错误: ${errors}`);
}

main().catch(console.error);
