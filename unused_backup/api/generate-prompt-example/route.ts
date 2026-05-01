import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { prompt, input } = await request.json();

    if (!prompt || !input) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const config = new Config();
    const client = new LLMClient(config);

    // 构建消息
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: prompt },
      { role: "user", content: input }
    ];

    // 使用流式生成
    const stream = client.stream(messages, {
      model: "doubao-seed-1-8-251228",
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
    console.error("生成案例失败:", error);
    return NextResponse.json(
      { error: "生成案例失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}
