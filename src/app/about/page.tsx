import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Users, Target, Award, Mail, MessageCircle, Heart, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: '关于我们 - AI视频工具集合',
  description: 'AI视频工具集合致力于为视频创作者提供最优质的AI工具推荐。我们精心筛选18+款AI视频生成、编辑工具，帮助创作者提高效率，释放创意。',
  keywords: ['关于我们', 'AI视频工具', '视频创作', '工具推荐', '创作者服务'],
  openGraph: {
    title: '关于我们 - AI视频工具集合',
    description: '致力于为视频创作者提供最优质的AI工具推荐',
    type: 'article',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-300">关于我们</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            致力于AI视频创作工具的<br />精选与推荐
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            我们是一群热爱AI技术的创作者，致力于为视频创作者、营销人员、教育工作者等提供最优质的AI视频工具推荐。
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              10万+ 用户信赖
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Video className="h-4 w-4 mr-2" />
              精选优质工具
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              专业测评团队
            </Badge>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                我们的使命
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                在AI技术快速发展的今天，视频创作正在经历一场革命。我们的使命是帮助每一位创作者找到最适合的AI工具，让视频创作变得更简单、更高效、更有创意。
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                我们相信，AI不应该取代创作者，而应该成为创作者最强大的助手。通过我们精心筛选的工具推荐，让您能够专注于创意本身，而不是被技术细节所困扰。
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Target className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">精准推荐</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">基于真实使用体验</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Heart className="h-10 w-10 mx-auto mb-3 text-pink-600" />
                  <h3 className="font-semibold mb-2">用心服务</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">倾听用户需求</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Award className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-2">专业测评</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">深入功能评估</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="h-10 w-10 mx-auto mb-3 text-green-600" />
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
            <Card className="text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold mb-2">18+</p>
                <p className="text-sm opacity-80">精选工具</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold mb-2">10万+</p>
                <p className="text-sm opacity-80">月活用户</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold mb-2">50万+</p>
                <p className="text-sm opacity-80">工具点击</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold mb-2">99%</p>
                <p className="text-sm opacity-80">用户满意度</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            为什么选择我们
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle>精选优质工具</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  我们的人工编辑团队亲自测试每一款工具，确保推荐的都是真正好用、实用的AI视频工具，帮助您节省筛选时间。
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <CardTitle>实时更新</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  AI技术发展日新月异，我们保持每周更新，第一时间为您带来最新、最强大的AI视频创作工具。
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-pink-600 dark:text-pink-300" />
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
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
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
                    <p className="text-sm opacity-80">contact@aivideotools.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">商务合作</p>
                    <p className="text-sm opacity-80">business@aivideotools.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 AI视频工具集合. 用心服务每一位创作者</p>
        </div>
      </footer>
    </div>
  );
}
