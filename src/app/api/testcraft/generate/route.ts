import { NextRequest, NextResponse } from 'next/server';

// Coze API 配置
const COZE_API_KEY = process.env.COZE_WORKLOAD_IDENTITY_API_KEY || process.env.OPENAI_API_KEY || '';
const COZE_API_BASE = 'https://integration.coze.cn/api/v3';

// 4sAPI 配置
const ENABLE_4SAPI = process.env.ENABLE_4SAPI === 'true';
const API4S_KEY = process.env.API4S_KEY || '';
const API4S_URL = process.env.API4S_URL || 'https://4sapi.com/v1';

// 4sAPI 专属模型列表
const API4S_MODELS = [
  'gpt-4o',
  'gpt-4o-mini', 
  'gpt-4-turbo',
  'claude-3-5-sonnet',
  'claude-3-5-haiku',
  'claude-sonnet-4',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
];

// 免费模型列表 (Coze)
const FREE_MODELS = [
  'doubao-seed-2-0-pro-260215',
  'doubao-seed-2-0-lite-260215',
  'doubao-seed-2-0-mini-260215',
  'doubao-seed-1-6-251015',
  'doubao-seed-1-8-251228',
  'doubao-seed-1-6-vision-250815',
  'doubao-seed-1-6-thinking-250715',
  'deepseek-v3-2-251201',
  'deepseek-r1-250528',
  'kimi-k2-5-260127',
  'glm-5-0-260211',
  'glm-5-turbo-260316',
  'glm-4-7-251222',
  'qwen-3-5-plus-260215',
];

// 检查是否为免费模型 (Coze)
function isFreeModel(model: string): boolean {
  const lowerModel = model?.toLowerCase() || '';
  return FREE_MODELS.some(m => lowerModel.includes(m.toLowerCase()));
}

// 检查是否为 4sAPI 模型
function is4sapiModel(model: string): boolean {
  const lowerModel = model?.toLowerCase() || '';
  return API4S_MODELS.some(m => lowerModel.includes(m.toLowerCase()));
}

// 调用 4sAPI
async function call4sapiAPI(messages: any[], model: string): Promise<string> {
  if (!ENABLE_4SAPI || !API4S_KEY) {
    throw new Error('4sAPI 未启用或未配置密钥');
  }

  const response = await fetch(`${API4S_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API4S_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`4sAPI error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// 测试用例生成系统提示词
const SYSTEM_PROMPT = `你是专业的测试用例工程师，擅长生成高质量的BDD格式测试用例。

请根据以下需求点，生成3-8个测试用例，每个用例采用BDD格式：
- Given（前提条件）：测试所需的前置环境和数据
- When（操作步骤）：具体的执行操作
- Then（预期结果）：期望的返回结果

输出格式要求（严格遵循）：
===CASE_SEPARATOR===
【用例标题】测试场景的标题
【优先级】P0/P1/P2（核心功能用P0，重要功能用P1，一般功能用P2）
【Given】
- 前提条件1
- 前提条件2
【When】
1. 操作步骤1
2. 操作步骤2
【Then】
1. 预期结果1
2. 预期结果2

===CASE_SEPARATOR===
[下一个用例...]

注意：
1. 每个用例之间用 ===CASE_SEPARATOR=== 分隔
2. 前2个用例必须是核心功能，标记为P0
3. 保持用例之间的独立性和可重复执行性
4. 量化可验证的预期结果
5. 最多生成8个用例`;

export async function POST(request: NextRequest) {
  try {
    const { requirementPoint, module, aiModel } = await request.json();

    if (!requirementPoint || !requirementPoint.title) {
      return NextResponse.json({ error: '请提供需求点信息' }, { status: 400 });
    }

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: `需求点标题：${requirementPoint.title}\n需求点描述：${requirementPoint.description || '无详细描述'}\n所属模块：${module || '通用'}` },
    ];

    let responseContent = '';

    // 判断使用哪个 API
    if (aiModel && is4sapiModel(aiModel)) {
      // 使用 4sAPI
      console.log('[TestCraft] 使用 4sAPI 模型:', aiModel);
      responseContent = await call4sapiAPI(messages, aiModel);
    } else if (aiModel && isFreeModel(aiModel)) {
      // 使用 Coze API (免费模型)
      console.log('[TestCraft] 使用 Coze 免费模型:', aiModel);
      const { LLMClient, Config, HeaderUtils } = await import('coze-coding-dev-sdk');
      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      const config = new Config();
      const client = new LLMClient(config, customHeaders);
      
      const response = await client.invoke(messages, {
        model: aiModel,
        temperature: 0.7,
      });
      
      responseContent = response.content;
    } else {
      // 默认使用豆包
      console.log('[TestCraft] 使用默认模型: doubao-seed-1-8-251228');
      const { LLMClient, Config, HeaderUtils } = await import('coze-coding-dev-sdk');
      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      const config = new Config();
      const client = new LLMClient(config, customHeaders);
      
      const response = await client.invoke(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.7,
      });
      
      responseContent = response.content;
    }

    if (!responseContent) {
      throw new Error('AI未返回有效内容');
    }

    // 解析测试用例
    const cases = parseTestCases(responseContent);
    return NextResponse.json({ 
      cases,
      rawContent: responseContent 
    });

  } catch (error: any) {
    console.error('TestCraft generate API error:', error);
    return NextResponse.json({ error: error.message || '生成失败' }, { status: 500 });
  }
}

function parseTestCases(content: string) {
  const cases = [];
  const parts = content.split('===CASE_SEPARATOR===').filter(p => p.trim());
  
  for (const part of parts) {
    const lines = part.trim().split('\n');
    let title = '';
    let priority = 'P1';
    let givens: string[] = [];
    let whens: string[] = [];
    let thens: string[] = [];
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('【用例标题】')) {
        title = trimmed.replace('【用例标题】', '').trim();
      } else if (trimmed.startsWith('【优先级】')) {
        priority = trimmed.replace('【优先级】', '').trim();
      } else if (trimmed.startsWith('【Given】')) {
        currentSection = 'given';
      } else if (trimmed.startsWith('【When】')) {
        currentSection = 'when';
      } else if (trimmed.startsWith('【Then】')) {
        currentSection = 'then';
      } else if (trimmed.startsWith('-') && currentSection === 'given') {
        givens.push(trimmed.replace(/^-\s*/, ''));
      } else if (/^\d+\./.test(trimmed) && currentSection === 'when') {
        whens.push(trimmed.replace(/^\d+\.\s*/, ''));
      } else if (/^\d+\./.test(trimmed) && currentSection === 'then') {
        thens.push(trimmed.replace(/^\d+\.\s*/, ''));
      }
    }
    
    if (title) {
      cases.push({
        id: `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        priority,
        given: givens,
        when: whens,
        then: thens,
      });
    }
  }
  
  return cases;
}
