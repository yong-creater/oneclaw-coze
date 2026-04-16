'use client';

import { forwardRef } from 'react';

// 简历数据结构
export interface ResumeData {
  name?: string;
  contact?: {
    phone?: string;
    email?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  objective?: string;
  summary?: string;
  education?: Array<{
    school: string;
    degree: string;
    major: string;
    gpa?: string;
    honors?: string;
    startDate?: string;
    endDate?: string;
  }>;
  experience?: Array<{
    company: string;
    position: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description: string;
    achievements?: string[];
  }>;
  projects?: Array<{
    name: string;
    role?: string;
    tech?: string[];
    startDate?: string;
    endDate?: string;
    description: string;
  }>;
  skills?: Array<{
    category: string;
    items: string[];
  }>;
  certifications?: string[];
  languages?: string[];
}

export type ResumeTemplateType = 
  | 'classic' | 'modern' | 'minimal' | 'executive' 
  | 'creative' | 'tech' | 'elegant' | 'startup';

// A4尺寸
const A4: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  padding: '12mm 14mm',
  background: '#ffffff',
  fontSize: '9pt',
  lineHeight: '1.45',
  boxSizing: 'border-box',
};

// ========== 模板1: 经典商务 (Prestige) ==========
export const ClassicTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"Times New Roman", Georgia, serif', color: '#1a1a2e', background: '#fff' }}>
    {/* 顶部装饰条 */}
    <div style={{ height: '4px', background: 'linear-gradient(90deg, #1a1a2e 0%, #4a4a6a 50%, #1a1a2e 100%)', marginBottom: '12px', borderRadius: '2px' }} />
    
    {/* 头部 */}
    <div style={{ textAlign: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #e5e5e5' }}>
      <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: '0 0 6px', letterSpacing: '4px', textTransform: 'uppercase', color: '#1a1a2e' }}>
        {data.name || 'Zhang Wei'}
      </h1>
      {data.objective && (
        <p style={{ fontSize: '10pt', color: '#666', margin: '0 0 8px', fontStyle: 'italic', letterSpacing: '1px' }}>{data.objective}</p>
      )}
      <div style={{ fontSize: '8.5pt', color: '#888', display: 'flex', justifyContent: 'center', gap: '16px' }}>
        {data.contact?.phone && <span>{data.contact.phone}</span>}
        {data.contact?.email && <span>{data.contact.email}</span>}
        {data.contact?.location && <span>{data.contact.location}</span>}
      </div>
    </div>

    {/* 个人简介 */}
    {data.summary && (
      <section style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #1a1a2e', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Professional Summary
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '9pt', color: '#444', lineHeight: '1.6' }}>{data.summary}</p>
      </section>
    )}

    {/* 教育背景 */}
    {data.education && data.education.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #1a1a2e', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Education
        </h2>
        {data.education.map((edu, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '9.5pt', color: '#1a1a2e' }}>{edu.school}</strong>
              <span style={{ fontSize: '8.5pt', color: '#888' }}>{edu.startDate} — {edu.endDate}</span>
            </div>
            <div style={{ fontSize: '8.5pt', color: '#555' }}>
              {edu.degree} · {edu.major}
              {edu.gpa && <span style={{ marginLeft: '8px' }}>GPA: {edu.gpa}</span>}
              {edu.honors && <span style={{ marginLeft: '8px', color: '#8b6914' }}>◆ {edu.honors}</span>}
            </div>
          </div>
        ))}
      </section>
    )}

    {/* 工作经历 */}
    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #1a1a2e', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Professional Experience
        </h2>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '9.5pt', color: '#1a1a2e' }}>{exp.company}</strong>
              <span style={{ fontSize: '8.5pt', color: '#888' }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <div style={{ fontSize: '8.5pt', color: '#666', fontStyle: 'italic', marginBottom: '4px' }}>{exp.position}</div>
            <div style={{ fontSize: '8.5pt', color: '#444', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
          </div>
        ))}
      </section>
    )}

    {/* 项目 */}
    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #1a1a2e', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Projects
        </h2>
        {data.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '9.5pt', color: '#1a1a2e' }}>{proj.name}</strong>
              <span style={{ fontSize: '8.5pt', color: '#888' }}>{proj.startDate} — {proj.endDate}</span>
            </div>
            {proj.tech && <div style={{ fontSize: '8pt', color: '#888', marginBottom: '2px' }}>{proj.tech.join(' · ')}</div>}
            <div style={{ fontSize: '8.5pt', color: '#444', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
          </div>
        ))}
      </section>
    )}

    {/* 技能与证书 */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {data.skills && data.skills.length > 0 && (
        <section>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #1a1a2e', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Skills
          </h2>
          {data.skills.map((skill, i) => (
            <div key={i} style={{ marginBottom: '4px', fontSize: '8.5pt' }}>
              <strong style={{ color: '#1a1a2e' }}>{skill.category}:</strong>
              <span style={{ color: '#555' }}> {skill.items.join(', ')}</span>
            </div>
          ))}
        </section>
      )}
      {data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #1a1a2e', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Certifications
          </h2>
          {data.certifications.map((cert, i) => (
            <div key={i} style={{ fontSize: '8.5pt', color: '#555', marginBottom: '3px' }}>◆ {cert}</div>
          ))}
        </section>
      )}
    </div>
  </div>
));
ClassicTemplate.displayName = 'ClassicTemplate';

// ========== 模板2: 现代简约 (Modern) ==========
export const ModernTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"SF Pro Display", "-apple-system", BlinkMacSystemFont, sans-serif', color: '#1e293b', background: '#fafbfc' }}>
    {/* 左侧彩色边栏 */}
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6mm', background: 'linear-gradient(180deg, #3b82f6 0%, #06b6d4 100%)' }} />
    
    {/* 头部 */}
    <div style={{ display: 'flex', marginBottom: '14px', paddingLeft: '10px' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '24pt', fontWeight: 700, margin: '0 0 6px', color: '#0f172a', letterSpacing: '-0.5px' }}>
          {data.name || 'Zhang Wei'}
        </h1>
        {data.objective && (
          <p style={{ fontSize: '10pt', color: '#64748b', margin: '0 0 10px', fontWeight: 500 }}>{data.objective}</p>
        )}
        <div style={{ display: 'flex', gap: '14px', fontSize: '8.5pt', color: '#64748b' }}>
          {data.contact?.phone && <span>☎ {data.contact.phone}</span>}
          {data.contact?.email && <span>✉ {data.contact.email}</span>}
          {data.contact?.location && <span>⌖ {data.contact.location}</span>}
        </div>
      </div>
    </div>

    {data.summary && (
      <section style={{ marginBottom: '12px', paddingLeft: '10px' }}>
        <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#3b82f6', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          — About
        </h2>
        <p style={{ margin: 0, fontSize: '9pt', color: '#475569', lineHeight: '1.6' }}>{data.summary}</p>
      </section>
    )}

    {data.education && data.education.length > 0 && (
      <section style={{ marginBottom: '12px', paddingLeft: '10px' }}>
        <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#3b82f6', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          — Education
        </h2>
        {data.education.map((edu, i) => (
          <div key={i} style={{ marginBottom: '6px', paddingLeft: '8px', borderLeft: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '9pt', color: '#1e293b' }}>{edu.school}</strong>
              <span style={{ fontSize: '8pt', color: '#94a3b8' }}>{edu.startDate} — {edu.endDate}</span>
            </div>
            <div style={{ fontSize: '8.5pt', color: '#64748b' }}>
              {edu.degree} · {edu.major}
              {edu.gpa && <span style={{ marginLeft: '8px' }}>GPA {edu.gpa}</span>}
            </div>
          </div>
        ))}
      </section>
    )}

    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: '12px', paddingLeft: '10px' }}>
        <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#3b82f6', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          — Experience
        </h2>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '10px', paddingLeft: '8px', borderLeft: '2px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontSize: '9pt', color: '#1e293b' }}>{exp.company}</strong>
              <span style={{ fontSize: '8pt', color: '#94a3b8' }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <div style={{ fontSize: '8.5pt', color: '#64748b', marginBottom: '4px' }}>{exp.position}</div>
            <div style={{ fontSize: '8.5pt', color: '#475569', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: '12px', paddingLeft: '10px' }}>
        <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#3b82f6', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          — Projects
        </h2>
        {data.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: '8px', paddingLeft: '8px', borderLeft: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontSize: '9pt', color: '#1e293b' }}>{proj.name}</strong>
              <span style={{ fontSize: '8pt', color: '#94a3b8' }}>{proj.startDate} — {proj.endDate}</span>
            </div>
            {proj.tech && <div style={{ fontSize: '8pt', color: '#06b6d4', marginBottom: '2px' }}>{proj.tech.join(' · ')}</div>}
            <div style={{ fontSize: '8.5pt', color: '#475569', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
          </div>
        ))}
      </section>
    )}

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingLeft: '10px' }}>
      {data.skills && data.skills.length > 0 && (
        <section>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#3b82f6', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            — Skills
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {data.skills.flatMap(s => s.items).map((skill, i) => (
              <span key={i} style={{ fontSize: '8pt', padding: '2px 8px', background: '#f1f5f9', borderRadius: '12px', color: '#64748b' }}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
      {data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#3b82f6', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            — Certifications
          </h2>
          {data.certifications.map((cert, i) => (
            <div key={i} style={{ fontSize: '8pt', color: '#475569', marginBottom: '2px' }}>◆ {cert}</div>
          ))}
        </section>
      )}
    </div>
  </div>
));
ModernTemplate.displayName = 'ModernTemplate';

// ========== 模板3: 极简英文 (Minimal) ==========
export const MinimalTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: '#000', background: '#fff', padding: '18mm 20mm' }}>
    {/* 头部 */}
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <h1 style={{ fontSize: '28pt', fontWeight: 300, margin: '0 0 10px', letterSpacing: '8px', textTransform: 'uppercase', color: '#000' }}>
        {data.name || 'Zhang Wei'}
      </h1>
      {data.objective && (
        <p style={{ fontSize: '9.5pt', color: '#666', margin: '0 0 12px', letterSpacing: '2px' }}>{data.objective}</p>
      )}
      <div style={{ fontSize: '8.5pt', color: '#999', letterSpacing: '0.5px' }}>
        {data.contact?.phone} · {data.contact?.email} · {data.contact?.location}
      </div>
    </div>

    {/* 细线分隔 */}
    <div style={{ height: '1px', background: '#e0e0e0', margin: '0 auto 20px', width: '40%' }} />

    {data.education && data.education.length > 0 && (
      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '8pt', fontWeight: 400, color: '#999', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
          Education
        </h2>
        {data.education.map((edu, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <strong style={{ fontWeight: 500, fontSize: '10pt' }}>{edu.school}</strong>
              <div style={{ color: '#666', fontSize: '9pt' }}>{edu.degree}, {edu.major}</div>
            </div>
            <span style={{ color: '#999', fontSize: '9pt' }}>{edu.startDate} — {edu.endDate}</span>
          </div>
        ))}
      </section>
    )}

    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '8pt', fontWeight: 400, color: '#999', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
          Experience
        </h2>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontWeight: 500, fontSize: '10pt' }}>{exp.company}</strong>
              <span style={{ color: '#999', fontSize: '9pt' }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <div style={{ fontSize: '9pt', color: '#666', marginBottom: '4px' }}>{exp.position}</div>
            <div style={{ fontSize: '9pt', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '8pt', fontWeight: 400, color: '#999', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
          Projects
        </h2>
        {data.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontWeight: 500, fontSize: '10pt' }}>{proj.name}</strong>
              <span style={{ color: '#999', fontSize: '9pt' }}>{proj.startDate} — {proj.endDate}</span>
            </div>
            {proj.tech && <div style={{ fontSize: '8.5pt', color: '#999', marginBottom: '2px' }}>{proj.tech.join(' / ')}</div>}
            <div style={{ fontSize: '9pt', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
          </div>
        ))}
      </section>
    )}

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {data.skills && data.skills.length > 0 && (
        <section>
          <h2 style={{ fontSize: '8pt', fontWeight: 400, color: '#999', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
            Skills
          </h2>
          <p style={{ fontSize: '9pt', textAlign: 'center', lineHeight: '1.8', color: '#333' }}>
            {data.skills.map(s => `${s.category}: ${s.items.join(', ')}`).join(' · ')}
          </p>
        </section>
      )}
      {data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 style={{ fontSize: '8pt', fontWeight: 400, color: '#999', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
            Certifications
          </h2>
          <p style={{ fontSize: '9pt', textAlign: 'center', color: '#333' }}>{data.certifications.join(' · ')}</p>
        </section>
      )}
    </div>
  </div>
));
MinimalTemplate.displayName = 'MinimalTemplate';

// ========== 模板4: 商务精英 (Executive) ==========
export const ExecutiveTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif', color: '#1a202c', background: '#fff' }}>
    {/* 深色头部 */}
    <div style={{ 
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 50%, #1e3a5f 100%)',
      color: '#fff',
      margin: '-12mm -14mm 14px -14mm',
      padding: '16mm 14mm 14mm',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 装饰圆形 */}
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: '-30px', left: '20%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
      
      <h1 style={{ fontSize: '26pt', fontWeight: 700, margin: '0 0 6px', letterSpacing: '4px', position: 'relative' }}>
        {data.name || '张三'}
      </h1>
      {data.objective && (
        <p style={{ fontSize: '10.5pt', color: '#a0b4c8', margin: '0 0 12px', letterSpacing: '1px' }}>{data.objective}</p>
      )}
      <div style={{ display: 'flex', gap: '20px', fontSize: '9pt', color: '#c9d6e3', position: 'relative' }}>
        {data.contact?.phone && <span>{data.contact.phone}</span>}
        {data.contact?.email && <span>{data.contact.email}</span>}
        {data.contact?.location && <span>{data.contact.location}</span>}
      </div>
    </div>

    {data.summary && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#c9a227', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#1e3a5f' }}>个人简介</h2>
        </div>
        <p style={{ margin: 0, fontSize: '9pt', color: '#4a5568', lineHeight: '1.65', paddingLeft: '11px' }}>{data.summary}</p>
      </section>
    )}

    {data.education && data.education.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#c9a227', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#1e3a5f' }}>教育背景</h2>
        </div>
        {data.education.map((edu, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', paddingLeft: '11px' }}>
            <div>
              <strong style={{ fontSize: '9.5pt', color: '#1a202c' }}>{edu.school}</strong>
              <span style={{ color: '#718096', marginLeft: '10px', fontSize: '9pt' }}>{edu.degree} · {edu.major}</span>
              {edu.honors && <span style={{ color: '#c9a227', fontSize: '8.5pt', marginLeft: '8px' }}>◆ {edu.honors}</span>}
            </div>
            <span style={{ color: '#a0aec0', fontSize: '8.5pt' }}>{edu.startDate} — {edu.endDate}</span>
          </div>
        ))}
      </section>
    )}

    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#c9a227', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#1e3a5f' }}>工作经历</h2>
        </div>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '10px', paddingLeft: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontSize: '9.5pt', color: '#1a202c' }}>{exp.company}</strong>
              <span style={{ color: '#a0aec0', fontSize: '8.5pt' }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <div style={{ fontSize: '9pt', color: '#c9a227', marginBottom: '4px', fontWeight: 500 }}>{exp.position}</div>
            <div style={{ fontSize: '8.5pt', color: '#4a5568', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#c9a227', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#1e3a5f' }}>项目经验</h2>
        </div>
        {data.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: '8px', paddingLeft: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontSize: '9.5pt', color: '#1a202c' }}>{proj.name}</strong>
              <span style={{ color: '#a0aec0', fontSize: '8.5pt' }}>{proj.startDate} — {proj.endDate}</span>
            </div>
            {proj.tech && <div style={{ fontSize: '8pt', color: '#c9a227', marginBottom: '2px' }}>{proj.tech.join(' / ')}</div>}
            <div style={{ fontSize: '8.5pt', color: '#4a5568', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
          </div>
        ))}
      </section>
    )}

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
      {data.skills && data.skills.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '3px', height: '14px', background: '#c9a227', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#1e3a5f' }}>技能特长</h2>
          </div>
          {data.skills.map((skill, i) => (
            <div key={i} style={{ marginBottom: '4px', fontSize: '8.5pt', paddingLeft: '11px' }}>
              <strong style={{ color: '#1a202c' }}>{skill.category}:</strong>
              <span style={{ color: '#718096' }}> {skill.items.join('、')}</span>
            </div>
          ))}
        </section>
      )}
      {data.certifications && data.certifications.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '3px', height: '14px', background: '#c9a227', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#1e3a5f' }}>证书资质</h2>
          </div>
          {data.certifications.map((cert, i) => (
            <div key={i} style={{ fontSize: '8.5pt', color: '#4a5568', marginBottom: '3px', paddingLeft: '11px' }}>◆ {cert}</div>
          ))}
        </section>
      )}
    </div>
  </div>
));
ExecutiveTemplate.displayName = 'ExecutiveTemplate';

// ========== 模板5: 创意活力 (Creative) ==========
export const CreativeTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif', color: '#2d3748', background: '#fff' }}>
    {/* 渐变头部 */}
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      margin: '-12mm -14mm 14px',
      padding: '14mm 14mm',
      position: 'relative',
    }}>
      {/* 装饰 */}
      <div style={{ position: 'absolute', top: '6mm', right: '10mm', fontSize: '24pt', color: 'rgba(255,255,255,0.2)' }}>✦</div>
      <div style={{ position: 'absolute', bottom: '4mm', left: '10mm', width: '30mm', height: '30mm', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      
      <h1 style={{ fontSize: '24pt', fontWeight: 700, margin: '0 0 6px', color: '#fff', letterSpacing: '2px' }}>
        {data.name || '张三'}
      </h1>
      {data.objective && (
        <p style={{ fontSize: '10pt', color: 'rgba(255,255,255,0.9)', margin: '0 0 10px', fontWeight: 300 }}>{data.objective}</p>
      )}
      <div style={{ display: 'flex', gap: '14px', fontSize: '8.5pt', color: 'rgba(255,255,255,0.85)' }}>
        {data.contact?.phone && <span>📱 {data.contact.phone}</span>}
        {data.contact?.email && <span>✉ {data.contact.email}</span>}
        {data.contact?.location && <span>📍 {data.contact.location}</span>}
      </div>
    </div>

    {data.summary && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '2px dashed #e2e8f0' }}>
          <span style={{ fontSize: '12pt' }}>💫</span>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#667eea' }}>关于我</h2>
        </div>
        <p style={{ margin: 0, fontSize: '9pt', color: '#4a5568', lineHeight: '1.65', paddingLeft: '18px' }}>{data.summary}</p>
      </section>
    )}

    {data.education && data.education.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '2px dashed #e2e8f0' }}>
          <span style={{ fontSize: '12pt' }}>🎓</span>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#667eea' }}>教育背景</h2>
        </div>
        {data.education.map((edu, i) => (
          <div key={i} style={{ marginBottom: '6px', paddingLeft: '18px', borderLeft: '3px solid #f093fb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '9.5pt', color: '#2d3748' }}>{edu.school}</strong>
              <span style={{ fontSize: '8.5pt', color: '#a0aec0' }}>{edu.startDate} — {edu.endDate}</span>
            </div>
            <div style={{ fontSize: '8.5pt', color: '#718096' }}>
              {edu.degree} · {edu.major}
              {edu.honors && <span style={{ color: '#764ba2' }}> · {edu.honors}</span>}
            </div>
          </div>
        ))}
      </section>
    )}

    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '2px dashed #e2e8f0' }}>
          <span style={{ fontSize: '12pt' }}>💼</span>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#667eea' }}>工作经历</h2>
        </div>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '10px', paddingLeft: '18px', borderLeft: '3px solid #764ba2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontSize: '9.5pt', color: '#2d3748' }}>{exp.company}</strong>
              <span style={{ fontSize: '8.5pt', color: '#a0aec0' }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <div style={{ fontSize: '8.5pt', color: '#764ba2', marginBottom: '4px', fontWeight: 500 }}>{exp.position}</div>
            <div style={{ fontSize: '8.5pt', color: '#4a5568', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '2px dashed #e2e8f0' }}>
          <span style={{ fontSize: '12pt' }}>🚀</span>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#667eea' }}>项目经验</h2>
        </div>
        {data.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: '8px', paddingLeft: '18px', borderLeft: '3px solid #f093fb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontSize: '9.5pt', color: '#2d3748' }}>{proj.name}</strong>
              <span style={{ fontSize: '8.5pt', color: '#a0aec0' }}>{proj.startDate} — {proj.endDate}</span>
            </div>
            {proj.tech && <div style={{ fontSize: '8pt', color: '#764ba2', marginBottom: '2px' }}>{proj.tech.join(' · ')}</div>}
            <div style={{ fontSize: '8.5pt', color: '#4a5568', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.skills && data.skills.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '2px dashed #e2e8f0' }}>
          <span style={{ fontSize: '12pt' }}>⚡</span>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#667eea' }}>技能特长</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '18px' }}>
          {data.skills.flatMap(s => s.items).map((skill, i) => (
            <span key={i} style={{ 
              fontSize: '8pt', 
              padding: '3px 10px', 
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              borderRadius: '14px', 
              color: '#667eea',
              border: '1px solid rgba(102,126,234,0.2)'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </section>
    )}

    {data.certifications && data.certifications.length > 0 && (
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '2px dashed #e2e8f0' }}>
          <span style={{ fontSize: '12pt' }}>🏆</span>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#667eea' }}>证书资质</h2>
        </div>
        <p style={{ fontSize: '8.5pt', color: '#4a5568', margin: 0, paddingLeft: '18px' }}>{data.certifications.join(' · ')}</p>
      </section>
    )}
  </div>
));
CreativeTemplate.displayName = 'CreativeTemplate';

// ========== 模板6: 科技未来 (Tech) ==========
export const TechTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace', color: '#00ff88', background: '#0a0a0f' }}>
    {/* 头部 */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #00ff8820' }}>
      <div style={{
        width: '50px', height: '50px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22pt', color: '#0a0a0f', fontWeight: 700
      }}>
        {data.name?.charAt(0) || 'Z'}
      </div>
      <div>
        <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: 0, color: '#ffffff', letterSpacing: '-0.5px' }}>
          {data.name || 'Zhang Wei'}
        </h1>
        <p style={{ fontSize: '9pt', color: '#00ff88', margin: '3px 0 0' }}>{data.objective || 'Software Engineer'}</p>
      </div>
    </div>

    <div style={{ display: 'flex', gap: '14px', fontSize: '8.5pt', color: '#666', marginBottom: '12px' }}>
      {data.contact?.phone && <span>{data.contact.phone}</span>}
      {data.contact?.email && <span>{data.contact.email}</span>}
      {data.contact?.location && <span>{data.contact.location}</span>}
    </div>

    {data.summary && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{ color: '#00ff88' }}>//</span>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>About</h2>
        </div>
        <p style={{ margin: 0, fontSize: '8.5pt', color: '#888', lineHeight: '1.6' }}>{data.summary}</p>
      </section>
    )}

    {data.education && data.education.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ color: '#00ff88' }}>//</span>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>Education</h2>
        </div>
        {data.education.map((edu, i) => (
          <div key={i} style={{ marginBottom: '6px', paddingLeft: '12px', borderLeft: '2px solid #00ff8840' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#00ff88', fontSize: '9pt' }}>{edu.school}</strong>
              <span style={{ color: '#555', fontSize: '8pt' }}>{edu.startDate} — {edu.endDate}</span>
            </div>
            <div style={{ color: '#888', fontSize: '8.5pt' }}>{edu.degree} · {edu.major}</div>
          </div>
        ))}
      </section>
    )}

    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ color: '#00ff88' }}>//</span>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>Experience</h2>
        </div>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '10px', paddingLeft: '12px', borderLeft: '2px solid #00d4ff40' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ color: '#00d4ff', fontSize: '9pt' }}>{exp.company}</strong>
              <span style={{ color: '#555', fontSize: '8pt' }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <div style={{ color: '#00ff88', fontSize: '8.5pt', marginBottom: '4px' }}>{exp.position}</div>
            <div style={{ color: '#888', fontSize: '8.5pt', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ color: '#00ff88' }}>//</span>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>Projects</h2>
        </div>
        {data.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid #ff00ff40' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ color: '#ff00ff', fontSize: '9pt' }}>{proj.name}</strong>
              <span style={{ color: '#555', fontSize: '8pt' }}>{proj.startDate} — {proj.endDate}</span>
            </div>
            {proj.tech && <div style={{ color: '#ff00ff', fontSize: '8pt', marginBottom: '2px', opacity: 0.7 }}>[{proj.tech.join(', ')}]</div>}
            <div style={{ color: '#888', fontSize: '8.5pt', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.skills && data.skills.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ color: '#00ff88' }}>//</span>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>Skills</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {data.skills.flatMap(s => s.items).map((skill, i) => (
            <span key={i} style={{ 
              fontSize: '8pt', 
              padding: '2px 8px', 
              background: '#00ff8815',
              border: '1px solid #00ff8830',
              borderRadius: '4px', 
              color: '#00ff88'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </section>
    )}

    {data.certifications && data.certifications.length > 0 && (
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{ color: '#00ff88' }}>//</span>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>Certs</h2>
        </div>
        <p style={{ fontSize: '8.5pt', color: '#888', margin: 0 }}>{data.certifications.join(' | ')}</p>
      </section>
    )}
  </div>
));
TechTemplate.displayName = 'TechTemplate';

// ========== 模板7: 优雅复古 (Elegant) ==========
export const ElegantTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif', color: '#3d3d3d', background: '#fefcf8' }}>
    {/* 装饰边框 */}
    <div style={{ position: 'absolute', top: '8mm', left: '8mm', right: '8mm', bottom: '8mm', border: '1px solid #d4c4a8', pointerEvents: 'none' }} />

    {/* 头部 */}
    <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '2px solid #8b7355' }}>
      <h1 style={{ fontSize: '26pt', fontWeight: 400, margin: '0 0 8px', color: '#2d2d2d', fontStyle: 'italic', letterSpacing: '4px' }}>
        {data.name || 'Zhang Wei'}
      </h1>
      {data.objective && (
        <p style={{ fontSize: '9.5pt', color: '#6b6b6b', margin: '0 0 10px', fontStyle: 'italic', letterSpacing: '1px' }}>{data.objective}</p>
      )}
      <div style={{ fontSize: '8.5pt', color: '#8b7355', display: 'flex', justifyContent: 'center', gap: '16px' }}>
        {data.contact?.phone} ◆ {data.contact?.email} ◆ {data.contact?.location}
      </div>
    </div>

    {data.summary && (
      <section style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '10pt', fontWeight: 400, color: '#8b7355', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center' }}>
          Profile
        </h2>
        <p style={{ margin: 0, fontSize: '9pt', color: '#5a5a5a', lineHeight: '1.8', textAlign: 'center', fontStyle: 'italic' }}>{data.summary}</p>
      </section>
    )}

    {data.education && data.education.length > 0 && (
      <section style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '10pt', fontWeight: 400, color: '#8b7355', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #d4c4a8', textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center' }}>
          Education
        </h2>
        {data.education.map((edu, i) => (
          <div key={i} style={{ marginBottom: '8px', textAlign: 'center' }}>
            <strong style={{ fontSize: '10pt', color: '#3d3d3d' }}>{edu.school}</strong>
            <div style={{ fontSize: '9pt', color: '#6b6b6b', fontStyle: 'italic' }}>
              {edu.degree}, {edu.major} ◆ {edu.startDate} — {edu.endDate}
            </div>
            {edu.honors && <div style={{ fontSize: '8.5pt', color: '#8b7355' }}>{edu.honors}</div>}
          </div>
        ))}
      </section>
    )}

    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '10pt', fontWeight: 400, color: '#8b7355', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #d4c4a8', textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center' }}>
          Experience
        </h2>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontSize: '10pt', color: '#3d3d3d', fontStyle: 'italic' }}>{exp.company}</strong>
              <span style={{ color: '#8b7355', fontSize: '9pt', fontStyle: 'italic' }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <div style={{ fontSize: '9pt', color: '#6b6b6b', marginBottom: '4px', textAlign: 'center', fontStyle: 'italic' }}>{exp.position}</div>
            <div style={{ fontSize: '9pt', color: '#5a5a5a', lineHeight: '1.65', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{exp.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '10pt', fontWeight: 400, color: '#8b7355', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #d4c4a8', textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center' }}>
          Projects
        </h2>
        {data.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontSize: '9.5pt', color: '#3d3d3d', fontStyle: 'italic' }}>{proj.name}</strong>
              <span style={{ color: '#8b7355', fontSize: '9pt', fontStyle: 'italic' }}>{proj.startDate} — {proj.endDate}</span>
            </div>
            {proj.tech && <div style={{ fontSize: '8.5pt', color: '#8b7355' }}>{proj.tech.join(' / ')}</div>}
            <div style={{ fontSize: '9pt', color: '#5a5a5a', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.skills && data.skills.length > 0 && (
      <section style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '10pt', fontWeight: 400, color: '#8b7355', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #d4c4a8', textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center' }}>
          Skills
        </h2>
        <p style={{ fontSize: '9pt', color: '#5a5a5a', textAlign: 'center', lineHeight: '1.8', fontStyle: 'italic' }}>
          {data.skills.map(s => `${s.category}: ${s.items.join(', ')}`).join(' · ')}
        </p>
      </section>
    )}

    {data.certifications && data.certifications.length > 0 && (
      <section>
        <h2 style={{ fontSize: '10pt', fontWeight: 400, color: '#8b7355', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #d4c4a8', textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center' }}>
          Certifications
        </h2>
        <p style={{ fontSize: '9pt', color: '#5a5a5a', textAlign: 'center', fontStyle: 'italic' }}>
          {data.certifications.join(' · ')}
        </p>
      </section>
    )}
  </div>
));
ElegantTemplate.displayName = 'ElegantTemplate';

// ========== 模板8: 创业风格 (Startup) ==========
export const StartupTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"Inter", "-apple-system", "BlinkMacSystemFont", sans-serif', color: '#111827', background: '#fff' }}>
    {/* 头部 */}
    <div style={{ display: 'flex', gap: '3px', marginBottom: '14px', minHeight: '60px' }}>
      <div style={{ width: '5px', background: '#f97316', borderRadius: '3px', marginRight: '10px' }} />
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '24pt', fontWeight: 800, margin: '0 0 4px', color: '#111827', letterSpacing: '-1px' }}>
          {data.name || '张三'}
        </h1>
        {data.objective && (
          <p style={{ fontSize: '9.5pt', color: '#6b7280', margin: '0 0 8px' }}>{data.objective}</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '8.5pt', color: '#9ca3af' }}>
          {data.contact?.phone && <span>{data.contact.phone}</span>}
          {data.contact?.email && <span>{data.contact.email}</span>}
          {data.contact?.location && <span>{data.contact.location}</span>}
        </div>
      </div>
      <div style={{ width: '5px', background: '#3b82f6', borderRadius: '3px' }} />
    </div>

    {data.summary && (
      <section style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '8.5pt', fontWeight: 600, color: '#f97316', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          ✦ Summary
        </h2>
        <p style={{ margin: 0, fontSize: '9pt', color: '#374151', lineHeight: '1.6' }}>{data.summary}</p>
      </section>
    )}

    {data.education && data.education.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '8.5pt', fontWeight: 600, color: '#f97316', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          ✦ Education
        </h2>
        {data.education.map((edu, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div>
              <strong style={{ fontSize: '9.5pt', color: '#111827' }}>{edu.school}</strong>
              <span style={{ color: '#6b7280', marginLeft: '8px', fontSize: '9pt' }}>{edu.degree} · {edu.major}</span>
            </div>
            <span style={{ fontSize: '8.5pt', color: '#9ca3af', whiteSpace: 'nowrap' }}>{edu.startDate} — {edu.endDate}</span>
          </div>
        ))}
      </section>
    )}

    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '8.5pt', fontWeight: 600, color: '#f97316', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          ✦ Experience
        </h2>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontSize: '9.5pt', color: '#111827' }}>{exp.company}</strong>
              <span style={{ fontSize: '8.5pt', color: '#9ca3af' }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <div style={{ fontSize: '9pt', color: '#3b82f6', marginBottom: '4px', fontWeight: 500 }}>{exp.position}</div>
            <div style={{ fontSize: '8.5pt', color: '#374151', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '8.5pt', fontWeight: 600, color: '#f97316', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          ✦ Projects
        </h2>
        {data.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <strong style={{ fontSize: '9.5pt', color: '#111827' }}>{proj.name}</strong>
              <span style={{ fontSize: '8.5pt', color: '#9ca3af' }}>{proj.startDate} — {proj.endDate}</span>
            </div>
            {proj.tech && <div style={{ fontSize: '8pt', color: '#3b82f6', marginBottom: '2px' }}>{proj.tech.join(' · ')}</div>}
            <div style={{ fontSize: '8.5pt', color: '#374151', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.skills && data.skills.length > 0 && (
      <section style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '8.5pt', fontWeight: 600, color: '#f97316', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          ✦ Skills
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {data.skills.flatMap(s => s.items).map((skill, i) => (
            <span key={i} style={{ 
              fontSize: '8pt', 
              padding: '3px 10px', 
              background: '#fff7ed', 
              borderRadius: '4px', 
              color: '#ea580c',
              border: '1px solid #fed7aa'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </section>
    )}

    {data.certifications && data.certifications.length > 0 && (
      <section>
        <h2 style={{ fontSize: '8.5pt', fontWeight: 600, color: '#f97316', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          ✦ Certifications
        </h2>
        <p style={{ fontSize: '8.5pt', color: '#374151', margin: 0 }}>{data.certifications.join(' · ')}</p>
      </section>
    )}
  </div>
));
StartupTemplate.displayName = 'StartupTemplate';

// ========== 模板映射 ==========
export const templates: Record<ResumeTemplateType, {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  tags: string[];
}> = {
  classic: { name: '经典商务', description: '传统稳重，彰显专业', component: ClassicTemplate, tags: ['传统', '专业'] },
  modern: { name: '现代简约', description: '清新活力，适合互联网', component: ModernTemplate, tags: ['现代', '活力'] },
  minimal: { name: '极简英文', description: '简洁国际，适合外企', component: MinimalTemplate, tags: ['极简', '国际'] },
  executive: { name: '商务精英', description: '深蓝金色，高端大气', component: ExecutiveTemplate, tags: ['精英', '高端'] },
  creative: { name: '创意活力', description: '紫粉渐变，活泼多彩', component: CreativeTemplate, tags: ['创意', '多彩'] },
  tech: { name: '科技未来', description: '赛博朋克，技术感强', component: TechTemplate, tags: ['程序员', '科技'] },
  elegant: { name: '优雅复古', description: '羊皮纸风格，典雅大气', component: ElegantTemplate, tags: ['优雅', '复古'] },
  startup: { name: '创业风格', description: '橙蓝双色，简洁有力', component: StartupTemplate, tags: ['创业', '简洁'] },
};

export function ResumePreview({ template, data }: { template: ResumeTemplateType; data: ResumeData }) {
  const TemplateComponent = templates[template]?.component;
  if (!TemplateComponent) return null;
  return <TemplateComponent data={data} />;
}

export function ResumeTemplateSelector({ selectedTemplate, onSelect }: { selectedTemplate: ResumeTemplateType; onSelect: (template: ResumeTemplateType) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-slate-500 mr-2">模板：</span>
      {(Object.entries(templates) as [ResumeTemplateType, typeof templates.classic][]).map(([key, template]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
            selectedTemplate === key
              ? 'bg-orange-500 text-white font-medium shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {template.name}
        </button>
      ))}
    </div>
  );
}

export function generateSampleResumeData(): ResumeData {
  return {
    name: '张伟',
    contact: { phone: '138-1234-5678', email: 'zhangwei@example.com', location: '北京·海淀区' },
    objective: '高级前端开发工程师',
    summary: '8年前端开发经验，擅长React/Vue生态，主导过多个DAU千万级产品。具备优秀的技术架构能力和团队协作能力。',
    education: [
      { school: '北京理工大学', degree: '硕士', major: '计算机科学与技术', gpa: '3.8/4.0', honors: '优秀毕业生', startDate: '2013.09', endDate: '2016.06' },
      { school: '北京航空航天大学', degree: '学士', major: '软件工程', startDate: '2009.09', endDate: '2013.06' },
    ],
    experience: [
      { company: '字节跳动', position: '前端架构组 / 高级前端工程师', startDate: '2020.03', endDate: '至今', description: '• 主导抖音直播中台系统建设，日活用户2000万+\n• 设计低延迟直播流媒体播放器，首屏时间从3.2s优化至0.8s\n• 搭建集团级前端监控平台，覆盖98%业务线' },
      { company: '阿里巴巴', position: '淘宝前端技术部 / 前端工程师', startDate: '2017.07', endDate: '2020.02', description: '• 主导商家工作台从jQuery迁移至React，迁移200+页面\n• 设计微前端架构方案，开发效率提升50%\n• 性能优化专项：首屏加载从4.5s降至1.2s' },
    ],
    projects: [
      { name: '企业级低代码平台', role: '技术负责人', tech: ['React', 'TypeScript', 'Monaco Editor'], startDate: '2022.01', endDate: '2022.12', description: '设计拖拽式页面搭建引擎，支持100+业务组件，月活开发者500+，产能提升3倍。' },
      { name: '前端智能监控平台', role: '核心开发', tech: ['Vue3', 'WebSocket', 'ClickHouse'], startDate: '2021.03', endDate: '2021.12', description: '前端错误监控、性能采集、用户行为分析三位一体，告警准确率95%。' },
    ],
    skills: [
      { category: '前端框架', items: ['React', 'Vue', 'Angular', 'Next.js'] },
      { category: '工程化', items: ['Webpack', 'Vite', 'TypeScript', 'Turborepo'] },
      { category: '后端', items: ['Node.js', 'Python', 'Go'] },
    ],
    certifications: ['AWS Certified Solutions Architect', 'Google Cloud Professional Developer'],
  };
}
