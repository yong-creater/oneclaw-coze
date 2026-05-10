import { NextRequest, NextResponse } from 'next/server';
import { generateWithModel } from '@/lib/model-selector';
import { HeaderUtils } from 'coze-coding-dev-sdk';
import { buildPrompt, ratioToSize } from '@/lib/prompt-engine';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// ===== 生成类型中文标签 =====
export const SUBTYPE_LABELS: Record<string, Record<string, string>> = {
  'product-generator': {
    'white-bg': '白底主图',
    'lifestyle': '场景图',
    'detail': '细节展示',
    'group': '组合搭配',
  },
  'xiaohongshu-generator': {
    'beauty': '美妆种草',
    'fashion': '穿搭分享',
    'lifestyle': '生活好物',
    'food': '美食探店',
  },
  'ai-photo': {
    'korean': '韩系写真',
    'retro': '复古写真',
    'cyberpunk': '赛博朋克',
    'japanese': '日系写真',
  },
};

// ===== 风格中文标签 =====
export const STYLE_LABELS: Record<string, Record<string, string>> = {
  'product-generator': {
    'premium': '高级质感',
    'minimal': '极简风格',
    'lifestyle': '生活场景',
  },
  'xiaohongshu-generator': {
    'fresh': '清新自然',
    'premium': '精致高级',
    'ins': 'INS 风格',
    'viral': '爆款风格',
  },
  'ai-photo': {
    'natural': '自然清新',
    'cinematic': '电影感',
    'artistic': '艺术创意',
    'magazine': '杂志封面',
  },
};

/**
 * 通用图片生成 API
 * 支持多张并行生成（count 参数）
 */
export async function POST(request: NextRequest) {
  try {
    // ===== 认证检查 =====
    const supabase = getSupabaseClient();
    const token = request.cookies.get('user_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();
    if (!session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: '登录已过期，请重新登录' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: '请求体格式错误' }, { status: 400 });
    }
    const { 
      prompt, 
      image,
      images,
      size, 
      ratio,
      style, 
      subtype,
      model, 
      tool_id,
      type,
      count = 1,
    } = body as Record<string, unknown>;
    
    // Type assertions
    const promptStr = typeof prompt === 'string' ? prompt : '';
    const imagesArr = Array.isArray(images) ? images as string[] : [];
    const sizeStr = typeof size === 'string' ? size : undefined;
    const ratioStr = typeof ratio === 'string' ? ratio : undefined;
    const styleStr = typeof style === 'string' ? style : undefined;
    const subtypeStr = typeof subtype === 'string' ? subtype : undefined;
    const modelStr = typeof model === 'string' ? model : undefined;
    const toolIdStr = typeof tool_id === 'string' ? tool_id : undefined;
    const typeStr = typeof type === 'string' ? type : undefined;
    const countNum = typeof count === 'number' ? count : 1;
    
    if (!promptStr || promptStr.trim().length === 0) {
      return NextResponse.json({ success: false, error: '请提供生成需求描述' }, { status: 400 });
    }

    // ===== 配额检查 =====
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabase
      .from('generation_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user_id)
      .gte('created_at', today.toISOString())
      .in('status', ['completed', 'generating']);
    // 从数据库读取配额配置
    const { data: settingData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'daily_generation_limit')
      .single();
    const config = (settingData?.value as { limit?: number; unlimited?: boolean }) || {};
    const isUnlimited = config.unlimited === true;
    const DAILY_FREE_LIMIT = isUnlimited ? -1 : (config.limit ?? 3);

    if (!isUnlimited && (todayCount || 0) >= DAILY_FREE_LIMIT) {
      return NextResponse.json({ 
        success: false, 
        error: `今日免费生成次数已用完（${DAILY_FREE_LIMIT}次/天），请明天再试或升级会员` 
      }, { status: 429 });
    }
    
    const finalSize = ratioToSize(ratioStr, sizeStr || '2K');
    const imageStr = typeof image === 'string' ? image : undefined;

    const effectiveToolId = toolIdStr || typeStr || 'product-generator';
    
    const imageArray = imagesArr.length > 0
      ? imagesArr
      : imageStr
        ? [imageStr]
        : [];
    const hasImage = imageArray.length > 0;
    const referenceImage = hasImage ? imageArray[0] : undefined;

    // 构建工具专属增强提示词（含guardrail负面词）
    const promptResult = buildPrompt({
      prompt: promptStr,
      toolType: effectiveToolId,
      style: styleStr,
      subtype: subtypeStr,
      ratio: ratioStr,
      hasImage,
      layoutMode: undefined,
    });

    const effectiveCount = Math.max(1, Math.min(countNum, 6));
    console.log(`[ImagesGenerate] tool=${effectiveToolId}, count=${effectiveCount}, hasImage=${hasImage}, ratio=${ratioStr || 'default'}`);

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 并行生成多张图片（传入负面词增强质量控制）
    const promises = Array.from({ length: effectiveCount }, () =>
      generateWithModel(
        promptResult.fullPrompt,
        modelStr || 'coze-image',
        finalSize,
        customHeaders,
        effectiveToolId,
        referenceImage,
        promptResult.negativePrompt
      )
    );

    const results = await Promise.allSettled(promises);

    // 收集所有成功生成的图片 URL
    const allImageUrls: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success && result.value.imageUrls) {
        allImageUrls.push(...result.value.imageUrls);
      } else {
        const errorMsg = result.status === 'fulfilled'
          ? (result.value.error || `第 ${index + 1} 张生成失败`)
          : `第 ${index + 1} 张生成异常`;
        errors.push(errorMsg);
      }
    });

    if (allImageUrls.length > 0) {
      // 自动保存生成记录到 user_generations 表
      try {
        await supabase.from('user_generations').insert({
          user_id: session.user_id,
          tool_id: effectiveToolId,
          tool_name: effectiveToolId,
          tool_type: effectiveToolId,
          title: promptStr.slice(0, 50) || 'AI生成作品',
          thumbnail: allImageUrls[0] || '',
          input_params: {
            prompt: promptStr,
            style: styleStr,
            subtype: subtypeStr,
            ratio: ratioStr,
            count: effectiveCount,
          },
          output_content: { image_urls: allImageUrls },
        });
      } catch (saveErr) {
        console.error('[图片生成] 保存记录失败:', saveErr);
        // 不影响生成结果返回
      }

      return NextResponse.json({
        success: true,
        imageUrls: allImageUrls,
        requestedCount: effectiveCount,
        successCount: allImageUrls.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errors.join('; ') || '图片生成失败',
    }, { status: 500 });
  } catch (error: any) {
    console.error('[图片生成] 错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
