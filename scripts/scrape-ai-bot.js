/**
 * ai-bot.cn 数据爬虫 v7 - 懒加载版本
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

const CATEGORIES = [
  { slug: 'ai-video-tools', name: 'AI视频工具' },
  { slug: 'ai-writing-tools', name: 'AI写作工具' },
  { slug: 'ai-image-tools', name: 'AI图像工具' },
  { slug: 'ai-office-tools', name: 'AI办公工具' },
  { slug: 'ai-agent', name: 'AI智能体' },
  { slug: 'ai-chatbot', name: 'AI聊天助手' },
  { slug: 'ai-coding-tools', name: 'AI编程工具' },
  { slug: 'ai-design-tools', name: 'AI设计工具' },
  { slug: 'ai-audio-tools', name: 'AI音频工具' },
  { slug: 'ai-search-engine', name: 'AI搜索引擎' },
  { slug: 'ai-development', name: 'AI开发平台' },
  { slug: 'ai-learning', name: 'AI学习网站' }
];

let allTools = [];

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// 解析方法1: 标准格式 data-url="..." title="..."
function parseFormat1(html, categorySlug) {
  const tools = [];
  const regex = /data-url="([^"]+)"[^>]+title="([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const url = decodeURIComponent(match[1]);
    const title = decodeURIComponent(match[2]);
    
    if (!url.startsWith('http')) continue;
    
    let name = title;
    let desc = '';
    const idx = title.indexOf(' - ');
    if (idx > 0) {
      name = title.substring(0, idx).trim();
      desc = title.substring(idx + 3).trim();
    }
    
    if (name.length < 2) continue;
    
    tools.push({
      id: crypto.createHash('md5').update(name).digest('hex').substring(0, 8),
      name,
      description: desc,
      logo: '',
      logo_url: url,
      category: categorySlug,
      url,
      source: 'ai-bot.cn'
    });
  }
  return tools;
}

// 解析方法2: title="..." data-url="..."
function parseFormat2(html, categorySlug) {
  const tools = [];
  const regex = /title="([^"]+)"[^>]+data-url="([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const title = decodeURIComponent(match[1]);
    const url = decodeURIComponent(match[2]);
    
    if (!url.startsWith('http')) continue;
    
    let name = title;
    let desc = '';
    const idx = title.indexOf(' - ');
    if (idx > 0) {
      name = title.substring(0, idx).trim();
      desc = title.substring(idx + 3).trim();
    }
    
    if (name.length < 2) continue;
    
    tools.push({
      id: crypto.createHash('md5').update(name).digest('hex').substring(0, 8),
      name,
      description: desc,
      logo: '',
      logo_url: url,
      category: categorySlug,
      url,
      source: 'ai-bot.cn'
    });
  }
  return tools;
}

// 解析方法3: 通过 WordPress REST API
async function parseViaRestApi(categorySlug) {
  try {
    // 尝试 WordPress REST API
    const html = await httpGet('https://ai-bot.cn/wp-json/wp/v2/posts?categories=xxx&per_page=100');
    // 这个可能不太适用
    return [];
  } catch {
    return [];
  }
}

async function scrapeCategory(cat) {
  process.stdout.write(`📂 ${cat.name}...`);
  try {
    const html = await httpGet(`https://ai-bot.cn/favorites/${cat.slug}/`);
    
    let tools = parseFormat1(html, cat.slug);
    if (tools.length === 0) {
      tools = parseFormat2(html, cat.slug);
    }
    
    console.log(` ✓ ${tools.length}个`);
    return tools;
  } catch (err) {
    console.log(` ✗ ${err.message}`);
    return [];
  }
}

async function main() {
  console.log('🚀 爬取数据...\n');
  
  for (const cat of CATEGORIES) {
    const tools = await scrapeCategory(cat);
    allTools = allTools.concat(tools);
    await new Promise(r => setTimeout(r, 500));
  }
  
  // 去重
  const seen = new Set();
  const unique = allTools.filter(t => {
    if (seen.has(t.name)) return false;
    seen.add(t.name);
    return true;
  });
  
  console.log(`\n📊 共 ${unique.length} 个工具`);
  fs.writeFileSync('/tmp/tools_data.json', JSON.stringify(unique, null, 2));
  
  // 示例
  console.log('\n📋 示例:');
  unique.slice(0, 3).forEach(t => {
    console.log(`  ${t.name} - ${t.description}`);
    console.log(`  URL: ${t.url}`);
  });
  
  return unique;
}

main().catch(console.error);
