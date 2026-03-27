import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Users, Target, Award, Mail, MessageCircle, Heart, Sparkles, ArrowLeft, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: '关于我们 - OneClaw',
  description: 'OneClaw致力于为视频创作者提供最优质的AI工具推荐。我们精心筛选66+款AI视频生成、编辑工具，帮助创作者提高效率，释放创意。',
  keywords: ['关于我们', 'AI视频工具', '视频创作', '工具推荐', '创作者服务', 'OneClaw'],
  openGraph: {
    title: '关于我们 - OneClaw',
    description: '致力于为视频创作者提供最优质的AI工具推荐',
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
                <div className="p-1 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow">
                  <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                    <span className="text-sm">🦞</span>
                  </div>
                </div>
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
            <span className="block text-2xl md:text-3xl mt-2 text-slate-600 dark:text-slate-400">AI视频工具箱</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            像小龙虾的钳子一样，精准抓取最优质的AI视频工具，助力创作者高效创作。
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
              专业测评团队
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
                为什么叫"钳爪"？
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                小龙虾的钳子是它最强大的武器，精准、有力、灵活。我们的使命就是像钳爪一样，帮您从海量工具中精准抓取最适合的那一款。
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                在AI技术快速发展的今天，视频创作正在经历一场革命。我们的使命是帮助每一位创作者找到最适合的AI工具，让视频创作变得更简单、更高效、更有创意。
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                我们相信，AI不应该取代创作者，而应该成为创作者最强大的助手。通过我们精心筛选的工具推荐，让您能够专注于创意本身，而不是被技术细节所困扰。
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center border-red-100 dark:border-red-900/30">
                <CardContent className="pt-6">
                  <Target className="h-10 w-10 mx-auto mb-3 text-red-500" />
                  <h3 className="font-semibold mb-2">精准抓取</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">像钳爪一样精准</p>
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
                  <h3 className="font-semibold mb-2">专业测评</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">深入功能评估</p>
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
                <p className="text-4xl font-bold mb-2">66+</p>
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
            为什么选择钳爪
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-red-100 dark:border-red-900/30">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>精选优质工具</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  我们的人工编辑团队亲自测试每一款工具，确保推荐的都是真正好用、实用的AI视频工具，帮助您节省筛选时间。
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
                  AI技术发展日新月异，我们保持每周更新，第一时间为您带来最新、最强大的AI视频创作工具。
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-amber-100 dark:border-amber-900/30">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle>专业测评</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  我们提供详细的功能对比、使用教程和最佳实践，帮助您快速上手并充分发挥每个工具的价值。
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
            <div className="p-1 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow">
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                <span className="text-sm">🦞</span>
              </div>
            </div>
            <span className="font-medium text-gray-900 dark:text-white"><span className="text-red-500">One</span><span className="text-orange-500">Claw</span></span>
          </div>
          <p>© 2024 <span className="text-red-500">One</span><span className="text-orange-500">Claw</span>. 用心服务每一位创作者</p>
        </div>
      </footer>
    </div>
  );
}
