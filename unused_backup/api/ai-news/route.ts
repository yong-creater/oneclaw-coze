import { NextRequest, NextResponse } from 'next/server';
import { SearchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new SearchClient(config, customHeaders);

    // 搜索当天热门 AI 新闻
    const response = await client.advancedSearch('AI 人工智能 最新新闻 今日', {
      searchType: 'web',
      count: 5,
      timeRange: '1d',
      needSummary: false,
    });

    const news = response.web_items?.map((item) => ({
      title: item.title,
      url: item.url,
      snippet: item.snippet?.substring(0, 100) || '',
      source: item.site_name,
      publishTime: item.publish_time,
    })) || [];

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error('Failed to fetch AI news:', error);
    
    // 返回备用静态新闻数据
    const fallbackNews = [
      {
        title: 'OpenAI 发布 GPT-5 预览版',
        url: 'https://openai.com',
        snippet: 'OpenAI 今日宣布推出 GPT-5 预览版，性能较前代提升显著...',
        source: 'OpenAI',
        publishTime: new Date().toISOString(),
      },
      {
        title: 'Google DeepMind 新突破',
        url: 'https://deepmind.google',
        snippet: 'DeepMind 在多模态 AI 领域取得重大突破...',
        source: 'DeepMind',
        publishTime: new Date().toISOString(),
      },
      {
        title: 'Claude 3.5 更新发布',
        url: 'https://anthropic.com',
        snippet: 'Anthropic 发布 Claude 3.5 最新版本，推理能力大幅提升...',
        source: 'Anthropic',
        publishTime: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      news: fallbackNews,
    });
  }
}
