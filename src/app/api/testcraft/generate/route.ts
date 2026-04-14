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

// 非流式版本（更稳定）
export async function POST(request: NextRequest) {
  try {
    const { requirementPoint, module, aiModel } = await request.json();

    if (!requirementPoint || !requirementPoint.title) {
      return NextResponse.json({ error: '请提供需求点信息' }, { status: 400 });
    }

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: `需求点标题：${requirementPoint.title}\n需求点描述：${requirementPoint.description || '无详细描述'}\n所属模块：${module || '通用'}` }
    ];

    // 使用Coze SDK
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const llmConfig = {
      model: aiModel || 'doubao-seed-1-6-251015',
      temperature: 0.7,
      streaming: false
    };

    // 非流式调用
    let content = '';
    
    try {
      const aiStream = client.stream(messages, llmConfig);
      
      for await (const chunk of aiStream) {
        if (chunk && typeof chunk === 'object' && 'content' in chunk) {
          content += (chunk as any).content || '';
        } else if (typeof chunk === 'string') {
          content += chunk;
        }
      }
    } catch (llmError) {
      console.error('LLM streaming error:', llmError);
      throw new Error('AI服务调用失败，请重试');
    }
    
    if (!content) {
      throw new Error('AI未返回有效内容');
    }
    
    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('Generate test cases error:', error);
    return NextResponse.json({ error: error.message || '生成失败' }, { status: 500 });
  }
}
