import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { category, count, startIndex } = await request.json();

    if (!category || !count) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是专业的提示词工程师，需要生成高质量的专业提示词。

每个提示词必须包含以下字段：
1. id: 唯一标识符，格式如 "${category.toLowerCase()}-001"
2. title: 简洁明了的标题
3. description: 简短描述（20-30字）
4. category: 分类名称
5. tags: 相关标签数组（3-5个标签）
6. featured: 是否推荐（boolean）
7. usage: 使用次数（随机10000-50000）
8. rating: 评分（4.5-5.0之间）
9. content: 提示词主体内容，包含：
   - 角色定位
   - 核心能力
   - 工作流程
   - 输出要求
10. example: 示例对象，包含input、output、type字段

请生成 ${count} 个"${category}"分类的高质量提示词，编号从 ${startIndex} 开始。
要求：
- 每个提示词都要专业、实用
- 内容要有差异化，避免重复
- 标题要吸引人
- 示例要真实可用

请以JSON数组格式输出，不要包含任何其他说明文字。`;

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `请生成${count}个"${category}"分类的高质量提示词` }
    ];

    const stream = client.stream(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.8,
    });

    let output = "";
    for await (const chunk of stream) {
      if (chunk.content) {
        output += chunk.content.toString();
      }
    }

    return NextResponse.json({
      success: true,
      output: output.trim()
    });
  } catch (error) {
    console.error("生成提示词失败:", error);
    return NextResponse.json(
      { error: "生成提示词失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}
