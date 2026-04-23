/**
 * 使用 coze-coding-dev-sdk 上传 logo 图片
 */

const fs = require('fs');
const https = require('https');
const { S3Storage } = require('coze-coding-dev-sdk');

// 初始化存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME || 'bucket_1774521900703',
  region: "cn-beijing",
});

// 使用 Google Favicon API 获取图片
function getGoogleFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

// 从 URL 下载图片
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// 提取域名
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

// 清理名称
function cleanName(name) {
  return (name || 'unknown')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
    .substring(0, 20);
}

// 主函数
async function main() {
  console.log('🚀 开始获取并上传 logo...\n');
  
  // 读取工具数据
  const tools = JSON.parse(fs.readFileSync('/tmp/tools_data.json', 'utf8'));
  console.log(`📊 共 ${tools.length} 个工具\n`);
  
  const uploaded = [];
  const failed = [];
  const skipped = [];
  
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    
    if (!tool.url) {
      skipped.push(tool.id);
      process.stdout.write(`[${i + 1}/${tools.length}] 无URL... ⊘\n`);
      continue;
    }
    
    const displayName = (tool.name || 'unknown').substring(0, 25);
    process.stdout.write(`[${i + 1}/${tools.length}] ${displayName}...`);
    
    try {
      const domain = extractDomain(tool.url);
      if (!domain) {
        skipped.push(tool.id);
        console.log(` ⊘ (无效URL)`);
        continue;
      }
      
      // 使用 Google Favicon API
      const faviconUrl = getGoogleFaviconUrl(domain);
      const imageBuffer = await downloadImage(faviconUrl);
      
      // 检查图片大小（Google默认图标很小）
      if (imageBuffer.length < 1000) {
        failed.push(tool.id);
        console.log(` ✗ (图标太小)`);
        continue;
      }
      
      // 上传到存储
      const fileName = `logos/${cleanName(tool.name)}_${tool.id}.png`;
      const key = await storage.uploadFile({
        fileContent: imageBuffer,
        fileName: fileName,
        contentType: 'image/png',
      });
      
      // 生成签名 URL
      const logoUrl = await storage.generatePresignedUrl({
        key: key,
        expireTime: 86400 * 365, // 1年
      });
      
      tool.logo = logoUrl;
      uploaded.push(tool.id);
      console.log(` ✓`);
      
    } catch (err) {
      failed.push(tool.id);
      console.log(` ✗ ${err.message.substring(0, 30)}`);
    }
    
    // 延迟避免过快请求
    await new Promise(r => setTimeout(r, 50));
  }
  
  console.log(`\n\n📊 完成！`);
  console.log(`✓ 成功: ${uploaded.length}`);
  console.log(`✗ 失败: ${failed.length}`);
  console.log(`⊘ 跳过: ${skipped.length}`);
  
  // 保存更新后的数据
  fs.writeFileSync('/tmp/tools_data_with_logos.json', JSON.stringify(tools, null, 2));
  console.log('\n✓ 数据已保存到 /tmp/tools_data_with_logos.json');
  
  // 显示示例
  console.log('\n📋 示例 (带logo):');
  tools.filter(t => t.logo && t.logo.startsWith('http')).slice(0, 5).forEach(t => {
    console.log(`  ${t.name}: ${t.logo.substring(0, 80)}...`);
  });
}

main().catch(console.error);
