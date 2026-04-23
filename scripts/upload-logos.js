/**
 * 上传工具logo - 使用工具官网favicon
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { S3Storage } = require('coze-coding-dev-sdk');

// 初始化
const supabaseUrl = process.env.COZE_SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  bucketName: process.env.COZE_BUCKET_NAME || 'bucket_1774521900703',
  region: "cn-beijing",
});

// 提取域名
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    let host = urlObj.hostname;
    // 移除www前缀
    if (host.startsWith('www.')) {
      host = host.substring(4);
    }
    return host;
  } catch {
    return null;
  }
}

// 清理名称
function cleanName(name) {
  return (name || 'tool')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
    .substring(0, 20);
}

// 下载图片（使用curl）
function downloadWithCurl(url, outputPath) {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    exec(`curl -s --max-time 15 -L "${url}" -o "${outputPath}"`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error.message));
      } else {
        // 检查文件是否存在且大小合理
        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          if (stats.size > 500) {
            resolve(stats.size);
          } else {
            reject(new Error('File too small'));
          }
        } else {
          reject(new Error('File not created'));
        }
      }
    });
  });
}

async function main() {
  console.log('🚀 开始获取并上传logo...\n');

  // 获取所有工具
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, official_url')
    .limit(100); // 先处理100个

  if (error) {
    console.log(`❌ 获取工具失败: ${error.message}`);
    return;
  }

  console.log(`📊 共 ${tools.length} 个工具\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    
    if (!tool.official_url) {
      failed++;
      continue;
    }

    const domain = extractDomain(tool.official_url);
    if (!domain) {
      failed++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${tools.length}] ${tool.name?.substring(0, 20)}...`);

    const tempPath = `/tmp/logo_${tool.id}.ico`;
    
    try {
      // 尝试下载favicon
      const faviconUrl = `https://${tool.official_url.includes('www.') ? '' : 'www.'}${domain}/favicon.ico`;
      await downloadWithCurl(faviconUrl, tempPath);
      
      // 上传到存储
      const fileName = `logos/${cleanName(tool.name)}_${tool.id}.png`;
      const key = await storage.uploadFile({
        fileContent: fs.readFileSync(tempPath),
        fileName: fileName,
        contentType: 'image/x-icon',
      });
      
      // 生成永久URL
      const logoUrl = await storage.generatePresignedUrl({
        key: key,
        expireTime: 86400 * 365,
      });
      
      // 更新数据库
      await supabase
        .from('tools')
        .update({ logo: logoUrl })
        .eq('id', tool.id);
      
      success++;
      console.log(` ✓`);
      
    } catch (err) {
      failed++;
      console.log(` ✗`);
    }

    // 清理临时文件
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    // 延迟
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n\n📊 完成！`);
  console.log(`✅ 成功: ${success}`);
  console.log(`❌ 失败: ${failed}`);
}

main().catch(console.error);
