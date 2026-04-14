// 批量生成提示词真实案例的脚本
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/generate-prompt-example';

// 选择要生成案例的提示词（每个分类选1-2个代表性的）
const selectedPrompts = [
  // 视频生成
  {
    file: 'prompts-video.ts',
    id: 'video-001',
    title: '短视频脚本生成',
    input: '写一个15秒的抖音短视频脚本，主题是咖啡店推荐'
  },
  {
    file: 'prompts-video.ts',
    id: 'video-005',
    title: '视频标题优化',
    input: '为我的健身教程视频起一个吸引人的标题，内容是"每天5分钟瘦肚子"'
  },
  
  // 图像生成
  {
    file: 'prompts-image.ts',
    id: 'image-001',
    title: 'Midjourney提示词生成',
    input: '生成一个科技感十足的AI机器人形象，要赛博朋克风格'
  },
  {
    file: 'prompts-image.ts',
    id: 'image-005',
    title: '产品海报设计',
    input: '为一款新推出的智能手表设计一张产品海报，突出科技感'
  },
  
  // 文本创作
  {
    file: 'prompts-text.ts',
    id: 'text-001',
    title: '文章大纲生成',
    input: '写一篇关于"远程办公的未来趋势"的文章大纲'
  },
  
  // 代码开发
  {
    file: 'prompts-code.ts',
    id: 'code-001',
    title: '代码注释生成',
    input: '为以下函数添加详细的中文注释：function debounce(fn, delay) { let timer = null; return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); }; }'
  },
  
  // 营销文案
  {
    file: 'prompts-marketing.ts',
    id: 'marketing-001',
    title: '产品文案撰写',
    input: '为一款新推出的智能保温杯写一段吸引人的产品文案'
  },
  
  // 数据分析
  {
    file: 'prompts-data.ts',
    id: 'data-001',
    title: '数据分析报告',
    input: '分析以下电商数据：月销售额100万，客单价200元，转化率3%，给出优化建议'
  },
  
  // 翻译润色
  {
    file: 'prompts-translate.ts',
    id: 'translate-001',
    title: '英文润色',
    input: '润色以下英文：This product is very good, many people like it, it have many features.'
  },
  
  // 教育学习
  {
    file: 'prompts-education.ts',
    id: 'education-001',
    title: '知识点讲解',
    input: '用通俗易懂的语言解释"量子计算"是什么'
  },
  
  // 商业策划
  {
    file: 'prompts-business.ts',
    id: 'business-001',
    title: '商业计划书',
    input: '为一个线上教育平台写一份简明的商业计划书大纲'
  }
];

async function generateExample(prompt) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.output;
    } else {
      console.error(`生成失败 [${prompt.title}]:`, data.error);
      return null;
    }
  } catch (error) {
    console.error(`请求失败 [${prompt.title}]:`, error.message);
    return null;
  }
}

async function main() {
  console.log('开始生成提示词案例...\n');
  
  const results = [];
  
  for (const prompt of selectedPrompts) {
    console.log(`正在生成: ${prompt.title}...`);
    
    // 读取提示词内容
    const filePath = path.join(__dirname, 'src/data', prompt.file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 提取提示词的content字段（简化处理，实际需要解析）
    const contentMatch = content.match(new RegExp(`id: '${prompt.id}'[\\s\\S]*?content: \`([\\s\\S]*?)\`,`));
    const promptContent = contentMatch ? contentMatch[1] : '';
    
    // 生成案例
    const output = await generateExample({
      prompt: promptContent,
      input: prompt.input
    });
    
    if (output) {
      results.push({
        id: prompt.id,
        title: prompt.title,
        input: prompt.input,
        output: output
      });
      console.log(`✓ 生成成功\n`);
    } else {
      console.log(`✗ 生成失败\n`);
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 保存结果
  fs.writeFileSync(
    path.join(__dirname, 'generated-examples.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );
  
  console.log(`\n生成完成！共生成 ${results.length} 个案例`);
  console.log('结果已保存到 generated-examples.json');
}

main().catch(console.error);
