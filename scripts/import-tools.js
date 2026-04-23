/**
 * 导入工具数据到数据库
 * 不获取logo，使用默认图标
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客户端
const supabaseUrl = process.env.COZE_SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 默认logo
const DEFAULT_LOGO = 'https://cdn.coze.cn/coze-coding-s3proxy/v1/bucket_1774521900703/logos/default.png';

// 分类映射
const CATEGORY_MAP = {
  'AI视频工具': 1,
  'AI写作工具': 2,
  'AI图像工具': 3,
  'AI办公工具': 4,
  'AI智能体': 5,
  'AI聊天助手': 6,
  'AI编程工具': 7,
  'AI设计工具': 8,
  'AI音频工具': 9,
  'AI搜索引擎': 10,
  'AI开发平台': 11,
  'AI学习网站': 12,
};

// 免费类型映射
const FREE_TYPE_MAP = {
  '免费': '完全免费',
  ' Freemium': '免费额度',
  ' freemium': '免费额度',
  '免费试用': '限时免费',
  '付费': '付费工具',
};

// 解析免费类型
function parseFreeType(desc) {
  if (!desc) return '免费额度';
  if (desc.includes('免费') && !desc.includes('付费')) return '完全免费';
  if (desc.includes('免费额度') || desc.includes('freemium')) return '免费额度';
  if (desc.includes('付费')) return '付费工具';
  if (desc.includes('试用')) return '限时免费';
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
  console.log('🚀 开始导入数据到数据库...\n');
  
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
    
    console.log(`📦 处理批次 ${batchNum}/${totalBatches}...`);
    
    const toolsToInsert = batch.map((tool, idx) => {
      const name = cleanName(tool.name);
      if (!name) {
        return null;
      }
      
      // 确定分类
      let categoryId = CATEGORY_MAP[tool.category] || 1;
      
      return {
        name: name,
        logo: DEFAULT_LOGO,
        producer: tool.producer || '',
        highlight: extractHighlight(tool.desc),
        category_id: categoryId,
        free_type: parseFreeType(tool.desc),
        free_quota_desc: tool.desc || '',
        official_url: tool.url || '',
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
      console.log(`   ❌ 批次错误: ${error.message}`);
      errors += toolsToInsert.length;
    } else {
      console.log(`   ✅ 插入 ${data?.length || 0} 条`);
      inserted += data?.length || 0;
      skipped += batch.length - (data?.length || 0);
    }
    
    // 延迟避免过快
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n\n📊 导入完成！`);
  console.log(`✅ 成功: ${inserted}`);
  console.log(`⊘ 跳过: ${skipped}`);
  console.log(`❌ 错误: ${errors}`);
  
  // 保存导入报告
  const report = {
    total: tools.length,
    inserted,
    skipped,
    errors,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync('/tmp/import_report.json', JSON.stringify(report, null, 2));
  console.log('\n✅ 报告已保存到 /tmp/import_report.json');
}

main().catch(console.error);
