/**
 * 上传默认logo并更新所有工具
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

async function main() {
  console.log('🚀 上传默认logo并更新工具...\n');

  // 创建一个简单的默认logo (1x1 透明PNG)
  const defaultLogoBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  try {
    // 上传默认logo
    console.log('📤 上传默认logo...');
    const key = await storage.uploadFile({
      fileContent: defaultLogoBuffer,
      fileName: 'logos/default.png',
      contentType: 'image/png',
    });

    const logoUrl = await storage.generatePresignedUrl({
      key: key,
      expireTime: 86400 * 365,
    });

    console.log(`✅ 上传成功: ${logoUrl}`);

    // 更新所有工具的logo
    console.log('\n📝 更新工具logo...');
    const { data, error } = await supabase
      .from('tools')
      .update({ logo: logoUrl })
      .neq('id', 0); // 更新所有记录

    if (error) {
      console.log(`❌ 更新失败: ${error.message}`);
    } else {
      console.log('✅ 所有工具logo已更新');
    }

  } catch (err) {
    console.log(`❌ 错误: ${err.message}`);
  }

  // 验证导入结果
  console.log('\n📊 验证导入结果...');
  const { count } = await supabase
    .from('tools')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ 数据库中现有 ${count} 个工具`);

  // 按分类统计
  const { data: byCategory } = await supabase
    .from('tools')
    .select('category_id')
    .then(async ({ data }) => {
      const counts = {};
      data?.forEach(t => {
        counts[t.category_id] = (counts[t.category_id] || 0) + 1;
      });
      return counts;
    });

  console.log('\n📋 按分类统计:');
  Object.entries(byCategory || {}).forEach(([cat, cnt]) => {
    console.log(`  分类 ${cat}: ${cnt} 个工具`);
  });
}

main().catch(console.error);
