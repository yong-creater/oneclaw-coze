import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Users, Target, Award, Mail, MessageCircle, Heart, Sparkles, ArrowLeft, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: '关于我们 - OneClaw',
  description: 'OneClaw 是一站式 AI 工具与资源导航平台，精心收录数百款优质 AI 工具，提供丰富的提示词模板和 AI 技能资源，助力用户高效使用各类 AI 产品。',
  keywords: ['关于我们', 'AI工具导航', 'AI工具推荐', '提示词模板', 'AI技能', 'OneClaw'],
  openGraph: {
    title: '关于我们 - OneClaw',
    description: '一站式 AI 工具与资源导航平台',
    type: 'article',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 返回导航 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </Button>
            </Link>
            <Link href="/">
              <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-2xl">🦞</span>
                <span className="font-medium text-slate-900 dark:text-white text-sm"><span className="text-red-500">One</span><span className="text-orange-500">Claw</span></span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">关于我们</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-red-500">One</span><span className="text-orange-500">Claw</span>
            <span className="block text-2xl md:text-3xl mt-2 text-slate-600 dark:text-slate-400">一站式 AI 工具与资源导航</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            像小龙虾的钳子一样，精准抓取最优质的 AI 工具、提示词模板和技能资源，助力用户高效驾驭 AI 技术。
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
              <Users className="h-4 w-4 mr-2" />
              10万+ 用户信赖
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
              <Video className="h-4 w-4 mr-2" />
              精选优质工具
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
              <Award className="h-4 w-4 mr-2" />
              专业内容团队
            </Badge>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                关于 OneClaw
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                OneClaw 致力于成为最全面的 AI 工具与资源导航平台。我们的使命是从海量 AI 资源中为您精准筛选最适合的工具、模板和技能。
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                在 AI 技术快速发展的今天，各类 AI 工具层出不穷。我们的使命是帮助每一位用户找到最适合的 AI 工具和资源，让 AI 技术变得更易用、更高效、更有价值。
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                我们相信，AI 不应该只是少数人的专利，而应该成为每个人都能轻松驾驭的工具。通过我们精心筛选的工具推荐、提示词模板和技能教程，让您能够专注于创意本身，而不是被技术细节所困扰。
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center border-red-100 dark:border-red-900/30">
                <CardContent className="pt-6">
                  <Target className="h-10 w-10 mx-auto mb-3 text-red-500" />
                  <h3 className="font-semibold mb-2">精准筛选</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">优质资源推荐</p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-orange-100 dark:border-orange-900/30">
                <CardContent className="pt-6">
                  <Heart className="h-10 w-10 mx-auto mb-3 text-orange-500" />
                  <h3 className="font-semibold mb-2">用心服务</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">倾听用户需求</p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-amber-100 dark:border-amber-900/30">
                <CardContent className="pt-6">
                  <Award className="h-10 w-10 mx-auto mb-3 text-amber-500" />
                  <h3 className="font-semibold mb-2">专业内容</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">深度测评评估</p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-rose-100 dark:border-rose-900/30">
                <CardContent className="pt-6">
                  <Users className="h-10 w-10 mx-auto mb-3 text-rose-500" />
                  <h3 className="font-semibold mb-2">社区驱动</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">用户反馈优化</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            我们的成绩
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold mb-2">117+</p>
                <p className="text-sm opacity-80">精选工具</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold mb-2">10万+</p>
                <p className="text-sm opacity-80">月活用户</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold mb-2">50万+</p>
                <p className="text-sm opacity-80">工具点击</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold mb-2">99%</p>
                <p className="text-sm opacity-80">用户满意度</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            为什么选择 OneClaw
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-red-100 dark:border-red-900/30">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>精选优质资源</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  我们的内容团队亲自测试每一款工具和资源，确保推荐的都是真正好用、实用的 AI 工具、提示词模板和技能教程，帮助您节省筛选时间。
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-orange-100 dark:border-orange-900/30">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>实时更新</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  AI 技术发展日新月异，我们保持每周更新，第一时间为您带来最新、最强大的 AI 工具和资源，让您始终站在技术前沿。
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-amber-100 dark:border-amber-900/30">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle>专业指南</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  我们提供详细的功能对比、使用教程和最佳实践，帮助您快速上手并充分发挥每个工具和资源的价值。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">联系我们</CardTitle>
              <CardDescription className="text-white/80">
                有任何建议或合作需求，欢迎随时联系我们
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">邮箱联系</p>
                    <p className="text-sm opacity-80">1017760688@qq.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">商务合作</p>
                    <p className="text-sm opacity-80">1017760688@qq.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 返回首页按钮 */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-2">
              <Home className="h-5 w-5" />
              返回首页，开始探索工具
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🦞</span>
            <span className="font-medium text-gray-900 dark:text-white"><span className="text-red-500">One</span><span className="text-orange-500">Claw</span></span>
          </div>
          <p>© 2024 <span className="text-red-500">One</span><span className="text-orange-500">Claw</span>. 用心服务每一位创作者</p>
        </div>
      </footer>
    </div>
  );
}
