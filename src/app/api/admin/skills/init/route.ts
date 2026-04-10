import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth';

// 默认技能分类和技能数据
const DEFAULT_SKILL_CATEGORIES = [
  { name: '前端开发', slug: 'frontend', icon: '🎨', color: '#3B82F6', sort_order: 1 },
  { name: '后端开发', slug: 'backend', icon: '⚙️', color: '#10B981', sort_order: 2 },
  { name: '移动开发', slug: 'mobile', icon: '📱', color: '#F59E0B', sort_order: 3 },
  { name: 'AI/ML', slug: 'ai-ml', icon: '🤖', color: '#8B5CF6', sort_order: 4 },
  { name: '数据库', slug: 'database', icon: '🗄️', color: '#EF4444', sort_order: 5 },
  { name: 'DevOps', slug: 'devops', icon: '🚀', color: '#06B6D4', sort_order: 6 },
  { name: '数据分析', slug: 'data', icon: '📊', color: '#EC4899', sort_order: 7 },
  { name: '设计工具', slug: 'design', icon: '✏️', color: '#F97316', sort_order: 8 },
];

const DEFAULT_SKILLS = [
  // 前端开发
  { name: 'React', slug: 'react', description: '用于构建用户界面的 JavaScript 库', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/react.svg', category_slug: 'frontend', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/facebook/react', official_url: 'https://react.dev' },
  { name: 'Vue.js', slug: 'vue', description: '渐进式 JavaScript 框架', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vuedotjs.svg', category_slug: 'frontend', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/vuejs/core', official_url: 'https://vuejs.org' },
  { name: 'Next.js', slug: 'nextjs', description: 'React 全栈框架，支持服务端渲染', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nextdotjs.svg', category_slug: 'frontend', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/vercel/next.js', official_url: 'https://nextjs.org' },
  { name: 'Tailwind CSS', slug: 'tailwindcss', description: '实用优先的 CSS 框架', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tailwindcss.svg', category_slug: 'frontend', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/tailwindlabs/tailwindcss', official_url: 'https://tailwindcss.com' },
  { name: 'TypeScript', slug: 'typescript', description: 'JavaScript 的超集，提供类型支持', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/typescript.svg', category_slug: 'frontend', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/microsoft/TypeScript', official_url: 'https://www.typescriptlang.org' },
  
  // 后端开发
  { name: 'Node.js', slug: 'nodejs', description: '基于 Chrome V8 引擎的 JavaScript 运行时', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nodedotjs.svg', category_slug: 'backend', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/nodejs/node', official_url: 'https://nodejs.org' },
  { name: 'Python', slug: 'python', description: '高级编程语言，广泛用于后端开发', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/python.svg', category_slug: 'backend', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/python/cpython', official_url: 'https://www.python.org' },
  { name: 'Go', slug: 'go', description: 'Google 开发的编译型编程语言', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/go.svg', category_slug: 'backend', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/golang/go', official_url: 'https://go.dev' },
  { name: 'FastAPI', slug: 'fastapi', description: '现代快速的 Python Web 框架', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/fastapi.svg', category_slug: 'backend', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/tiangolo/fastapi', official_url: 'https://fastapi.tiangolo.com' },
  { name: 'Django', slug: 'django', description: 'Python 全栈 Web 框架', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/django.svg', category_slug: 'backend', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/django/django', official_url: 'https://www.djangoproject.com' },
  
  // 移动开发
  { name: 'React Native', slug: 'reactnative', description: '使用 React 构建原生移动应用', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/react.svg', category_slug: 'mobile', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/facebook/react-native', official_url: 'https://reactnative.dev' },
  { name: 'Flutter', slug: 'flutter', description: 'Google 的跨平台 UI 工具包', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/flutter.svg', category_slug: 'mobile', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/flutter/flutter', official_url: 'https://flutter.dev' },
  { name: 'Flutter', slug: 'dart', description: 'Google 开发的编程语言', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dart.svg', category_slug: 'mobile', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/dart-lang/sdk', official_url: 'https://dart.dev' },
  
  // AI/ML
  { name: 'TensorFlow', slug: 'tensorflow', description: 'Google 开发的机器学习框架', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tensorflow.svg', category_slug: 'ai-ml', pricing: '免费', difficulty: '高级', github_url: 'https://github.com/tensorflow/tensorflow', official_url: 'https://www.tensorflow.org' },
  { name: 'PyTorch', slug: 'pytorch', description: 'Facebook 开发的深度学习框架', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pytorch.svg', category_slug: 'ai-ml', pricing: '免费', difficulty: '高级', github_url: 'https://github.com/pytorch/pytorch', official_url: 'https://pytorch.org' },
  { name: 'LangChain', slug: 'langchain', description: '用于构建 LLM 应用的框架', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/langchain.svg', category_slug: 'ai-ml', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/langchain-ai/langchain', official_url: 'https://www.langchain.com' },
  { name: 'Hugging Face', slug: 'huggingface', description: 'AI 模型库和社区', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/huggingface.svg', category_slug: 'ai-ml', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/huggingface', official_url: 'https://huggingface.co' },
  { name: 'OpenAI API', slug: 'openai', description: '访问 GPT 等大语言模型', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openai.svg', category_slug: 'ai-ml', pricing: '付费', difficulty: '入门', official_url: 'https://openai.com' },
  
  // 数据库
  { name: 'PostgreSQL', slug: 'postgresql', description: '开源关系型数据库', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/postgresql.svg', category_slug: 'database', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/postgres/postgres', official_url: 'https://www.postgresql.org' },
  { name: 'MongoDB', slug: 'mongodb', description: 'NoSQL 文档数据库', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mongodb.svg', category_slug: 'database', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/mongodb/mongo', official_url: 'https://www.mongodb.com' },
  { name: 'Redis', slug: 'redis', description: '开源内存数据结构存储', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/redis.svg', category_slug: 'database', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/redis/redis', official_url: 'https://redis.io' },
  { name: 'Supabase', slug: 'supabase', description: '开源 Firebase 替代方案', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/supabase.svg', category_slug: 'database', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/supabase/supabase', official_url: 'https://supabase.com' },
  
  // DevOps
  { name: 'Docker', slug: 'docker', description: '容器化平台', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/docker.svg', category_slug: 'devops', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/docker', official_url: 'https://www.docker.com' },
  { name: 'Kubernetes', slug: 'kubernetes', description: '容器编排平台', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/kubernetes.svg', category_slug: 'devops', pricing: '免费', difficulty: '高级', github_url: 'https://github.com/kubernetes/kubernetes', official_url: 'https://kubernetes.io' },
  { name: 'GitHub Actions', slug: 'githubactions', description: 'CI/CD 工作流自动化', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', category_slug: 'devops', pricing: '免费', difficulty: '进阶', github_url: 'https://github.com/actions', official_url: 'https://github.com/features/actions' },
  { name: 'Vercel', slug: 'vercel', description: '前端云部署平台', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vercel.svg', category_slug: 'devops', pricing: '免费', difficulty: '入门', official_url: 'https://vercel.com' },
  
  // 数据分析
  { name: 'Pandas', slug: 'pandas', description: 'Python 数据分析库', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pandas.svg', category_slug: 'data', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/pandas-dev/pandas', official_url: 'https://pandas.pydata.org' },
  { name: 'NumPy', slug: 'numpy', description: 'Python 数值计算库', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/numpy.svg', category_slug: 'data', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/numpy/numpy', official_url: 'https://numpy.org' },
  { name: 'Jupyter', slug: 'jupyter', description: '交互式计算环境', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jupyter.svg', category_slug: 'data', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/jupyter', official_url: 'https://jupyter.org' },
  
  // 设计工具
  { name: 'Figma', slug: 'figma', description: '协作设计工具', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg', category_slug: 'design', pricing: 'Freemium', difficulty: '入门', official_url: 'https://figma.com' },
  { name: 'Tailwind CSS', slug: 'tailwindcss-design', description: '实用优先的 CSS 框架', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tailwindcss.svg', category_slug: 'design', pricing: '免费', difficulty: '入门', github_url: 'https://github.com/tailwindlabs/tailwindcss', official_url: 'https://tailwindcss.com' },
  { name: 'Framer', slug: 'framer', description: '交互式原型设计工具', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/framer.svg', category_slug: 'design', pricing: '付费', difficulty: '进阶', official_url: 'https://framer.com' },
];

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { force } = body; // force: 是否强制覆盖

    // 检查是否已有分类数据
    const { data: existingCategories } = await supabase
      .from('skill_categories')
      .select('id')
      .limit(1);

    if (existingCategories && existingCategories.length > 0 && !force) {
      return NextResponse.json({
        success: false,
        error: '技能分类已存在，如需重新初始化请设置 force: true'
      }, { status: 400 });
    }

    // 如果强制覆盖，先删除现有数据
    if (force) {
      await supabase.from('skills').delete().neq('id', 0);
      await supabase.from('skill_categories').delete().neq('id', 0);
    }

    // 插入分类
    const categoryResults = [];
    for (const cat of DEFAULT_SKILL_CATEGORIES) {
      const { data, error } = await supabase
        .from('skill_categories')
        .insert(cat)
        .select()
        .single();
      
      if (!error && data) {
        categoryResults.push({ ...data, slug: cat.slug });
      }
    }

    // 创建 slug -> id 映射
    const categoryMap = new Map(categoryResults.map(c => [c.slug, c.id]));

    // 插入技能
    const skillResults = [];
    for (const skill of DEFAULT_SKILLS) {
      const categoryId = categoryMap.get(skill.category_slug);
      if (!categoryId) continue;

      const { data, error } = await supabase
        .from('skills')
        .insert({
          name: skill.name,
          slug: skill.slug,
          description: skill.description,
          logo: skill.logo,
          category_id: categoryId,
          official_url: skill.official_url,
          github_url: skill.github_url,
          pricing: skill.pricing,
          difficulty: skill.difficulty,
          is_featured: skill.pricing === '免费',
          is_active: true,
        })
        .select()
        .single();
      
      if (!error && data) {
        skillResults.push(data);
      }
    }

    return NextResponse.json({
      success: true,
      message: '技能数据初始化成功',
      data: {
        categories_created: categoryResults.length,
        skills_created: skillResults.length,
      }
    });
  } catch (error) {
    console.error('初始化技能数据失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 获取初始化状态
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    const { count: categoryCount } = await supabase
      .from('skill_categories')
      .select('*', { count: 'exact', head: true });

    const { count: skillCount } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: {
        categories: categoryCount || 0,
        skills: skillCount || 0,
        initialized: (categoryCount || 0) > 0,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
