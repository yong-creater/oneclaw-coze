'use client';

import { forwardRef } from 'react';

// 简历数据结构
export interface ResumeData {
  name?: string;
  contact?: {
    phone?: string;
    email?: string;
    location?: string;
  };
  objective?: string;
  education?: Array<{
    school: string;
    degree: string;
    major: string;
    startDate?: string;
    endDate?: string;
  }>;
  experience?: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description: string;
  }>;
  projects?: Array<{
    name: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    description: string;
  }>;
  skills?: string[];
  certifications?: string[];
}

// 模板类型
export type ResumeTemplateType = 'classic' | 'modern' | 'minimal' | 'professional';

// 通用样式 (A4尺寸 210mm x 297mm)
const A4_STYLE = {
  width: '210mm',
  minHeight: '297mm',
  padding: '15mm 18mm',
  background: '#ffffff',
  fontSize: '10pt',
  lineHeight: '1.5',
};

// ==================== 经典模板 ====================
export const ClassicTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: 'Georgia, Times New Roman, serif',
          color: '#333',
        }}
      >
        {/* 头部 */}
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
          <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '2px' }}>
            {data.name || '张三'}
          </h1>
          <div style={{ fontSize: '10pt', color: '#555' }}>
            {data.contact?.phone && <span>{data.contact.phone} | </span>}
            {data.contact?.email && <span>{data.contact.email} | </span>}
            {data.contact?.location && <span>{data.contact.location}</span>}
          </div>
        </div>

        {/* 求职意向 */}
        {data.objective && (
          <section style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>
              求职意向
            </h2>
            <p style={{ margin: 0 }}>{data.objective}</p>
          </section>
        )}

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>
              教育背景
            </h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{edu.school}</strong>
                  <span>{edu.startDate || ''} - {edu.endDate || ''}</span>
                </div>
                <div>{edu.degree} · {edu.major}</div>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>
              工作经历
            </h2>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{exp.company}</strong>
                  <span>{exp.startDate || ''} - {exp.endDate || ''}</span>
                </div>
                <div style={{ fontStyle: 'italic', color: '#555', marginBottom: '5px' }}>{exp.position}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目经验 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>
              项目经验
            </h2>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{proj.name}</strong>
                  {proj.role && <span>{proj.role}</span>}
                  <span>{proj.startDate || ''} - {proj.endDate || ''}</span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能特长 */}
        {data.skills && data.skills.length > 0 && (
          <section style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>
              技能特长
            </h2>
            <p style={{ margin: 0 }}>{data.skills.join(' | ')}</p>
          </section>
        )}

        {/* 证书资质 */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>
              证书资质
            </h2>
            <p style={{ margin: 0 }}>{data.certifications.join(' | ')}</p>
          </section>
        )}
      </div>
    );
  }
);

ClassicTemplate.displayName = 'ClassicTemplate';

// ==================== 现代模板 ====================
export const ModernTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          color: '#1a1a1a',
        }}
      >
        {/* 头部 - 左侧色块 */}
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <div style={{ width: '4px', background: 'linear-gradient(to bottom, #2563eb, #06b6d4)', marginRight: '15px', borderRadius: '2px' }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b' }}>
              {data.name || '张三'}
            </h1>
            {data.objective && (
              <p style={{ fontSize: '11pt', color: '#64748b', margin: '0 0 12px 0' }}>{data.objective}</p>
            )}
            <div style={{ display: 'flex', gap: '15px', fontSize: '9pt', color: '#64748b' }}>
              {data.contact?.phone && <span>📱 {data.contact.phone}</span>}
              {data.contact?.email && <span>✉️ {data.contact.email}</span>}
              {data.contact?.location && <span>📍 {data.contact.location}</span>}
            </div>
          </div>
        </div>

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '11pt', fontWeight: 600, color: '#2563eb', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              教育背景
            </h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: '10pt' }}>{edu.school}</strong>
                  <span style={{ color: '#64748b' }}> · {edu.degree} · {edu.major}</span>
                </div>
                <span style={{ fontSize: '9pt', color: '#94a3b8' }}>{edu.startDate || ''} - {edu.endDate || ''}</span>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '11pt', fontWeight: 600, color: '#2563eb', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              工作经历
            </h2>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10pt', color: '#1e293b' }}>{exp.company}</strong>
                  <span style={{ fontSize: '9pt', color: '#94a3b8' }}>{exp.startDate || ''} - {exp.endDate || ''}</span>
                </div>
                <div style={{ fontSize: '9pt', color: '#64748b', marginBottom: '5px' }}>{exp.position}</div>
                <div style={{ fontSize: '9.5pt', color: '#475569', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目经验 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '11pt', fontWeight: 600, color: '#2563eb', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              项目经验
            </h2>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10pt' }}>{proj.name}</strong>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {proj.role && <span style={{ fontSize: '9pt', color: '#64748b' }}>{proj.role}</span>}
                    <span style={{ fontSize: '9pt', color: '#94a3b8' }}>{proj.startDate || ''} - {proj.endDate || ''}</span>
                  </div>
                </div>
                <div style={{ fontSize: '9.5pt', color: '#475569', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能与证书 */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {data.skills && data.skills.length > 0 && (
            <section style={{ flex: 1 }}>
              <h2 style={{ fontSize: '11pt', fontWeight: 600, color: '#2563eb', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                技能特长
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.skills.map((skill, i) => (
                  <span key={i} style={{ fontSize: '9pt', padding: '3px 10px', background: '#f1f5f9', borderRadius: '4px', color: '#475569' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
          {data.certifications && data.certifications.length > 0 && (
            <section style={{ flex: 1 }}>
              <h2 style={{ fontSize: '11pt', fontWeight: 600, color: '#2563eb', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                证书资质
              </h2>
              <p style={{ fontSize: '9.5pt', color: '#475569', margin: 0 }}>{data.certifications.join(' | ')}</p>
            </section>
          )}
        </div>
      </div>
    );
  }
);

ModernTemplate.displayName = 'ModernTemplate';

// ==================== 简约模板 ====================
export const MinimalTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
          color: '#000',
        }}
      >
        {/* 头部 */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontSize: '28pt', fontWeight: 300, margin: '0 0 10px 0', letterSpacing: '4px' }}>
            {data.name || '张三'}
          </h1>
          {data.objective && (
            <p style={{ fontSize: '10pt', color: '#666', margin: '0 0 10px 0' }}>{data.objective}</p>
          )}
          <div style={{ fontSize: '9pt', color: '#999', letterSpacing: '1px' }}>
            {data.contact?.phone} · {data.contact?.email} · {data.contact?.location}
          </div>
        </div>

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '9pt', fontWeight: 400, color: '#999', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Education
            </h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontWeight: 500 }}>{edu.school}</strong>
                  <span style={{ color: '#666' }}> — {edu.degree}, {edu.major}</span>
                </div>
                <span style={{ color: '#999' }}>{edu.startDate || ''} - {edu.endDate || ''}</span>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '9pt', fontWeight: 400, color: '#999', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Experience
            </h2>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <strong style={{ fontWeight: 500 }}>{exp.company}</strong>
                  <span style={{ color: '#999' }}>{exp.startDate || ''} - {exp.endDate || ''}</span>
                </div>
                <div style={{ fontSize: '9.5pt', color: '#666', marginBottom: '5px', fontStyle: 'italic' }}>{exp.position}</div>
                <div style={{ fontSize: '10pt', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目经验 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '9pt', fontWeight: 400, color: '#999', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Projects
            </h2>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <strong style={{ fontWeight: 500 }}>{proj.name}</strong>
                  <span style={{ color: '#999' }}>{proj.startDate || ''} - {proj.endDate || ''}</span>
                </div>
                <div style={{ fontSize: '10pt', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能 */}
        {data.skills && data.skills.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '9pt', fontWeight: 400, color: '#999', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Skills
            </h2>
            <p style={{ fontSize: '10pt', margin: 0 }}>{data.skills.join(' · ')}</p>
          </section>
        )}

        {/* 证书 */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <h2 style={{ fontSize: '9pt', fontWeight: 400, color: '#999', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Certifications
            </h2>
            <p style={{ fontSize: '10pt', margin: 0 }}>{data.certifications.join(' · ')}</p>
          </section>
        )}
      </div>
    );
  }
);

MinimalTemplate.displayName = 'MinimalTemplate';

// ==================== 专业模板 ====================
export const ProfessionalTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: 'Microsoft YaHei, PingFang SC, sans-serif',
          color: '#333',
        }}
      >
        {/* 头部 - 深色背景 */}
        <div style={{ background: '#1a365d', color: '#fff', margin: '-15mm -18mm 20px -18mm', padding: '20mm 18mm', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26pt', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            {data.name || '张三'}
          </h1>
          {data.objective && (
            <p style={{ fontSize: '11pt', color: '#a0aec0', margin: '0 0 15px 0' }}>{data.objective}</p>
          )}
          <div style={{ fontSize: '9.5pt', color: '#e2e8f0' }}>
            {data.contact?.phone} | {data.contact?.email} | {data.contact?.location}
          </div>
        </div>

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '3px', height: '14px', background: '#c05621', marginRight: '8px' }} />
              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', margin: 0, color: '#1a365d' }}>教育背景</h2>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: '10.5pt' }}>{edu.school}</strong>
                  <span style={{ color: '#666' }}> | {edu.degree} | {edu.major}</span>
                </div>
                <span style={{ color: '#999' }}>{edu.startDate || ''} - {edu.endDate || ''}</span>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '3px', height: '14px', background: '#c05621', marginRight: '8px' }} />
              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', margin: 0, color: '#1a365d' }}>工作经历</h2>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '10.5pt' }}>{exp.company}</strong>
                  <span style={{ color: '#999' }}>{exp.startDate || ''} - {exp.endDate || ''}</span>
                </div>
                <div style={{ fontSize: '9.5pt', color: '#c05621', marginBottom: '6px' }}>{exp.position}</div>
                <div style={{ fontSize: '10pt', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目经验 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '3px', height: '14px', background: '#c05621', marginRight: '8px' }} />
              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', margin: 0, color: '#1a365d' }}>项目经验</h2>
            </div>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '10.5pt' }}>{proj.name}</strong>
                  <span style={{ color: '#999' }}>{proj.startDate || ''} - {proj.endDate || ''}</span>
                </div>
                {proj.role && <div style={{ fontSize: '9.5pt', color: '#c05621', marginBottom: '4px' }}>{proj.role}</div>}
                <div style={{ fontSize: '10pt', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能与证书 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {data.skills && data.skills.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '3px', height: '14px', background: '#c05621', marginRight: '8px' }} />
                <h2 style={{ fontSize: '12pt', fontWeight: 'bold', margin: 0, color: '#1a365d' }}>技能特长</h2>
              </div>
              <div style={{ fontSize: '10pt', lineHeight: '1.8' }}>
                {data.skills.map((skill, i) => (
                  <span key={i} style={{ display: 'inline-block', marginRight: '10px' }}>◆ {skill}</span>
                ))}
              </div>
            </section>
          )}
          {data.certifications && data.certifications.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '3px', height: '14px', background: '#c05621', marginRight: '8px' }} />
                <h2 style={{ fontSize: '12pt', fontWeight: 'bold', margin: 0, color: '#1a365d' }}>证书资质</h2>
              </div>
              <p style={{ fontSize: '10pt', lineHeight: '1.8', margin: 0 }}>
                {data.certifications.map((cert, i) => (
                  <span key={i} style={{ display: 'block' }}>◆ {cert}</span>
                ))}
              </p>
            </section>
          )}
        </div>
      </div>
    );
  }
);

ProfessionalTemplate.displayName = 'ProfessionalTemplate';

// ==================== 模板选择器 ====================
const templates = {
  classic: {
    name: '经典商务',
    description: '传统稳重型，适合国企/传统行业',
    component: ClassicTemplate,
    preview: 'bg-slate-100',
  },
  modern: {
    name: '现代简约',
    description: '清新活力型，适合互联网/科技公司',
    component: ModernTemplate,
    preview: 'bg-gradient-to-br from-blue-50 to-cyan-50',
  },
  minimal: {
    name: '极简英文',
    description: '简洁国际型，适合外企/海归背景',
    component: MinimalTemplate,
    preview: 'bg-white',
  },
  professional: {
    name: '专业顾问',
    description: '稳重专业型，适合咨询/金融/管理岗',
    component: ProfessionalTemplate,
    preview: 'bg-slate-800 text-white',
  },
};

interface ResumeTemplateSelectorProps {
  selectedTemplate: ResumeTemplateType;
  onSelect: (template: ResumeTemplateType) => void;
}

export function ResumeTemplateSelector({ selectedTemplate, onSelect }: ResumeTemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-800 dark:text-white">选择简历模板</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(templates) as [ResumeTemplateType, typeof templates.classic][]).map(([key, template]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`relative p-3 rounded-xl border-2 transition-all ${
              selectedTemplate === key
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md'
                : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
            }`}
          >
            {/* 预览缩略图 */}
            <div className={`aspect-[3/4] rounded-lg mb-3 ${template.preview} p-2 flex items-center justify-center overflow-hidden`}>
              <div className="w-full h-full bg-white rounded shadow-sm p-1.5 text-[6px] leading-tight">
                <div className="h-3 w-16 bg-slate-200 rounded mb-1 mx-auto" />
                <div className="h-1.5 w-12 bg-slate-100 rounded mb-2 mx-auto" />
                <div className="h-1.5 w-full bg-slate-200 rounded mb-0.5" />
                <div className="h-1.5 w-full bg-slate-100 rounded mb-0.5" />
                <div className="h-1.5 w-3/4 bg-slate-200 rounded" />
              </div>
            </div>
            
            {/* 模板信息 */}
            <div className="text-center">
              <div className={`font-medium text-sm ${
                selectedTemplate === key ? 'text-orange-600' : 'text-slate-700 dark:text-slate-300'
              }`}>
                {template.name}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                {template.description}
              </div>
            </div>
            
            {/* 选中标识 */}
            {selectedTemplate === key && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 简历预览组件 ====================
interface ResumePreviewProps {
  template: ResumeTemplateType;
  data: ResumeData;
}

export function ResumePreview({ template, data }: ResumePreviewProps) {
  const TemplateComponent = templates[template].component;
  return <TemplateComponent data={data} />;
}

export { templates };
