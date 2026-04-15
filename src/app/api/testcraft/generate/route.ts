import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

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

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: `需求点标题：${requirementPoint.title}\n需求点描述：${requirementPoint.description || '无详细描述'}\n所属模块：${module || '通用'}` },
    ];

    try {
      // 使用 invoke 方法（非流式）
      const response = await client.invoke(messages, {
        model: aiModel || 'doubao-seed-1-8-251228',
        temperature: 0.7,
      });

      if (!response || !response.content) {
        throw new Error('AI未返回有效内容');
      }

      // 解析测试用例
      const cases = parseTestCases(response.content);
      return NextResponse.json({ 
        cases,
        rawContent: response.content 
      });
    } catch (llmError: any) {
      console.error('TestCraft generate error:', llmError);
      throw new Error('生成服务调用失败，请重试');
    }

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
