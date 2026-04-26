'use client';

import { useState } from 'react';
import { Check, Eye } from 'lucide-react';
import { ResumeTemplateType, templates, ResumeData, generateSampleResumeData } from '../tools/ResumeTemplates';

interface TemplateCardProps {
  templateKey: ResumeTemplateType;
  template: typeof templates.classic;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ templateKey, template, isSelected, onSelect }: TemplateCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  // 获取预览背景色
  const getPreviewBg = () => {
    switch (templateKey) {
      case 'classic': return 'from-slate-100 to-slate-200';
      case 'modern': return 'from-blue-50 to-cyan-50';
      case 'minimal': return 'from-white to-gray-50';
      case 'executive': return 'from-slate-800 to-slate-900';
      case 'creative': return 'from-purple-500 to-pink-500';
      case 'tech': return 'from-gray-900 to-black';
      case 'elegant': return 'from-amber-50 to-stone-100';
      case 'startup': return 'from-orange-100 to-blue-100';
      default: return 'from-slate-100 to-slate-200';
    }
  };

  // 获取文字颜色
  const getTextColor = () => {
    return ['executive', 'tech'].includes(templateKey) ? 'text-white' : 'text-slate-800';
  };

  return (
    <>
      <div
        className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg transform scale-[1.02]' 
            : 'ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-orange-300 hover:shadow-md'
        }`}
        onClick={onSelect}
      >
        {/* 预览缩略图 */}
        <div className={`h-32 bg-gradient-to-br ${getPreviewBg()} relative`}>
          {/* 模拟简历内容 */}
          <div className="absolute inset-2 p-2">
            <div className="space-y-1">
              <div className={`h-3 ${templateKey === 'tech' ? 'bg-green-500/30' : 'bg-slate-300/50'} rounded w-3/4`} />
              <div className={`h-2 ${templateKey === 'tech' ? 'bg-green-500/20' : 'bg-slate-200/50'} rounded w-1/2`} />
              <div className={`h-1.5 ${templateKey === 'tech' ? 'bg-cyan-500/20' : 'bg-slate-200/50'} rounded w-2/3 mt-2`} />
              <div className="h-1 bg-slate-300/30 rounded w-full mt-1" />
              <div className="h-1 bg-slate-300/30 rounded w-5/6" />
              <div className="h-1 bg-slate-300/30 rounded w-4/6 mt-2" />
              <div className="h-1 bg-slate-300/30 rounded w-full mt-1" />
              <div className="flex gap-1 mt-2">
                <div className={`h-2 ${templateKey === 'tech' ? 'bg-pink-500/30' : templateKey === 'executive' ? 'bg-amber-500/30' : 'bg-blue-400/30'} rounded-full w-8`} />
                <div className={`h-2 ${templateKey === 'tech' ? 'bg-pink-500/30' : templateKey === 'executive' ? 'bg-amber-500/30' : 'bg-blue-400/30'} rounded-full w-12`} />
                <div className={`h-2 ${templateKey === 'tech' ? 'bg-pink-500/30' : templateKey === 'executive' ? 'bg-amber-500/30' : 'bg-blue-400/30'} rounded-full w-10`} />
              </div>
            </div>
          </div>

          {/* 选中标记 */}
          {isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}

          {/* 预览按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(true);
            }}
            className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* 模板信息 */}
        <div className="p-3 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm text-slate-800 dark:text-white">{template.name}</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{template.description}</p>
          <div className="flex gap-1 mt-2">
            {template.tags.map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 预览弹窗 */}
      {showPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-orange-500 to-amber-500">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-white" />
                <h2 className="text-lg font-semibold text-white">{template.name} - 模板预览</h2>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 简历预览 */}
            <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-6">
              <div className="flex justify-center">
                <div className="shadow-2xl">
                  <div 
                    className="bg-white"
                    style={{
                      width: '210mm',
                      minHeight: '297mm',
                      transform: 'scale(0.55)',
                      transformOrigin: 'top center',
                    }}
                  >
                    {templateKey === 'classic' && (
                      <div className="p-8 font-serif">
                        <div className="text-center mb-6 pb-4 border-b-2 border-slate-800">
                          <h1 className="text-3xl font-bold tracking-widest uppercase">Zhang Wei</h1>
                          <p className="text-sm text-slate-500 mt-2">Senior Frontend Engineer</p>
                          <p className="text-xs text-slate-400 mt-1">138-1234-5678 | zhangwei@example.com | Beijing</p>
                        </div>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h2 className="text-base font-bold border-b border-slate-300 pb-1 mb-2">Experience</h2>
                            <div className="space-y-2">
                              <div className="flex justify-between"><strong>ByteDance</strong><span className="text-slate-500">2020 - Present</span></div>
                              <p className="text-slate-600 text-xs">Senior Frontend Engineer, TikTok Live Streaming Team</p>
                            </div>
                            <div className="space-y-2 mt-3">
                              <div className="flex justify-between"><strong>Alibaba</strong><span className="text-slate-500">2017 - 2020</span></div>
                              <p className="text-slate-600 text-xs">Frontend Engineer, Taobao Frontend Team</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {templateKey === 'modern' && (
                      <div className="p-8 font-sans">
                        <div className="flex gap-4 mb-6">
                          <div className="w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded"></div>
                          <div>
                            <h1 className="text-3xl font-bold text-slate-900">Zhang Wei</h1>
                            <p className="text-sm text-slate-500 mt-1">Senior Frontend Engineer</p>
                            <p className="text-xs text-slate-400 mt-1">138-1234-5678 · zhangwei@example.com · Beijing</p>
                          </div>
                        </div>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h2 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">EXPERIENCE</h2>
                            <div className="space-y-3">
                              <div className="border-l-2 border-slate-200 pl-3">
                                <div className="flex justify-between"><strong className="text-slate-800">ByteDance</strong><span className="text-slate-400">2020 - Present</span></div>
                                <p className="text-slate-500 text-xs">Senior Frontend Engineer</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {templateKey === 'minimal' && (
                      <div className="p-10 font-sans">
                        <div className="text-center mb-8">
                          <h1 className="text-4xl font-extralight tracking-widest uppercase">Zhang Wei</h1>
                          <p className="text-sm text-slate-500 mt-3 tracking-wide">Senior Frontend Engineer</p>
                          <div className="text-xs text-slate-400 mt-2">138-1234-5678 · zhangwei@example.com · Beijing</div>
                        </div>
                        <div className="h-px bg-slate-200 w-3/5 mx-auto mb-6"></div>
                        <div className="text-center space-y-4 text-sm">
                          <div>
                            <h2 className="text-xs text-slate-400 uppercase tracking-widest mb-3">Experience</h2>
                            <div className="space-y-3">
                              <div className="flex justify-between"><strong>ByteDance</strong><span className="text-slate-400">2020 — Present</span></div>
                              <p className="text-slate-600 italic">Senior Frontend Engineer</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {templateKey === 'executive' && (
                      <div className="font-sans">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 -m-8 mb-6">
                          <h1 className="text-3xl font-bold tracking-wider">张伟</h1>
                          <p className="text-slate-400 mt-2">高级前端开发工程师</p>
                          <p className="text-sm text-slate-500 mt-3">138-1234-5678 · zhangwei@example.com · 北京</p>
                        </div>
                        <div className="px-8 space-y-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1 h-4 bg-amber-500 rounded"></div>
                              <h2 className="font-bold text-slate-800">工作经历</h2>
                            </div>
                            <div className="ml-3 space-y-2">
                              <div className="flex justify-between"><strong>字节跳动</strong><span className="text-slate-400">2020 - 至今</span></div>
                              <p className="text-slate-600 text-xs">前端架构组 / 高级前端工程师</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {templateKey === 'creative' && (
                      <div className="font-sans">
                        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-fuchsia-500 text-white p-8 -m-8 mb-6 relative overflow-hidden">
                          <div className="absolute top-4 right-8 text-6xl opacity-20">✦</div>
                          <h1 className="text-3xl font-bold">张伟</h1>
                          <p className="text-white/90 mt-1">高级前端开发工程师</p>
                          <p className="text-sm text-white/80 mt-3">📱 138-1234-5678 · ✉️ zhangwei@example.com · 📍 北京</p>
                        </div>
                        <div className="px-8 space-y-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">💼</span>
                              <h2 className="font-bold text-purple-600">工作经历</h2>
                            </div>
                            <div className="ml-6 border-l-2 border-pink-400 pl-4 space-y-2">
                              <div className="flex justify-between"><strong>字节跳动</strong><span className="text-slate-400">2020 - 至今</span></div>
                              <p className="text-slate-600 text-xs">前端架构组 / 高级前端工程师</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {templateKey === 'tech' && (
                      <div className="p-8 font-mono text-green-400 bg-black min-h-[297mm]">
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-green-900">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-3xl text-black font-bold">Z</div>
                          <div>
                            <h1 className="text-3xl font-bold text-white">Zhang Wei</h1>
                            <p className="text-green-400 text-sm">Software Engineer</p>
                          </div>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div><span className="text-green-600">//</span> <span className="text-white uppercase">Experience</span></div>
                          <div className="border-l-2 border-green-800 pl-3">
                            <div className="flex justify-between"><span className="text-cyan-400">ByteDance</span><span className="text-slate-600">2020 - Present</span></div>
                            <p className="text-slate-400 text-xs">Senior Frontend Engineer</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {templateKey === 'elegant' && (
                      <div className="p-8 font-serif bg-stone-50" style={{ fontFamily: 'Palatino, Georgia, serif' }}>
                        <div className="text-center mb-6 pb-4 border-b-2 border-amber-700">
                          <h1 className="text-3xl italic text-slate-800 tracking-widest">Zhang Wei</h1>
                          <p className="text-sm text-slate-500 italic mt-2">Senior Frontend Engineer</p>
                          <p className="text-xs text-amber-700 mt-2">138-1234-5678 ◆ zhangwei@example.com ◆ Beijing</p>
                        </div>
                        <div className="text-center space-y-4 text-sm">
                          <div>
                            <h2 className="text-xs uppercase tracking-widest text-amber-700 mb-3">Experience</h2>
                            <div className="space-y-2">
                              <div><strong className="italic">ByteDance</strong> <span className="text-slate-400 italic">2020 — Present</span></div>
                              <p className="text-slate-600 italic text-xs">Senior Frontend Engineer</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {templateKey === 'startup' && (
                      <div className="p-8 font-sans">
                        <div className="flex gap-3 mb-6 min-h-[60px]">
                          <div className="w-2 bg-orange-500 rounded-full"></div>
                          <div className="flex-1">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">张伟</h1>
                            <p className="text-sm text-slate-500 mt-1">高级前端开发工程师</p>
                            <p className="text-xs text-slate-400">138-1234-5678 · zhangwei@example.com · 北京</p>
                          </div>
                          <div className="w-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div><span className="text-orange-500">✦</span> <span className="font-semibold text-orange-500 uppercase text-xs">Experience</span></div>
                          <div className="flex justify-between"><strong>字节跳动</strong><span className="text-slate-400">2020 - 至今</span></div>
                          <p className="text-slate-600 text-xs">前端架构组 / 高级前端工程师</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部操作 */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface EnhancedTemplateSelectorProps {
  selectedTemplate: ResumeTemplateType;
  onSelect: (template: ResumeTemplateType) => void;
}

export function EnhancedTemplateSelector({ selectedTemplate, onSelect }: EnhancedTemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-slate-800 dark:text-white">选择简历模板</h3>
          <p className="text-sm text-slate-500 mt-0.5">共 8 款专业模板，点击可预览效果</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(templates) as [ResumeTemplateType, typeof templates.classic][]).map(([key, template]) => (
          <TemplateCard
            key={key}
            templateKey={key}
            template={template}
            isSelected={selectedTemplate === key}
            onSelect={() => onSelect(key)}
          />
        ))}
      </div>
    </div>
  );
}
