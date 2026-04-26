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
}

export type ResumeTemplateType = 
  | 'classic' | 'modern' | 'minimal' | 'executive' 
  | 'creative' | 'tech' | 'elegant' | 'startup';

// A4基础尺寸
const A4: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  background: '#ffffff',
  fontSize: '9.5pt',
  lineHeight: '1.5',
};

// ========== 模板1: 经典商务 (Classic) - 双栏布局 ==========
export const ClassicTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif', color: '#333333', display: 'flex' }}>
    {/* 左侧边栏 */}
    <div style={{ width: '72mm', background: 'linear-gradient(180deg, #1a365d 0%, #2d4a7c 100%)', padding: '10mm 6mm', color: '#fff' }}>
      {/* 头像占位 */}
      <div style={{ width: '28mm', height: '28mm', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', margin: '0 auto 6mm', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24pt' }}>
        {(data.name || 'Z').charAt(0)}
      </div>
      
      {/* 姓名 */}
      <h1 style={{ fontSize: '16pt', fontWeight: 700, textAlign: 'center', margin: '0 0 2mm', letterSpacing: '2px' }}>
        {data.name || '张三'}
      </h1>
      {data.objective && (
        <p style={{ fontSize: '8pt', textAlign: 'center', color: 'rgba(255,255,255,0.8)', margin: '0 0 6mm', paddingBottom: '4mm', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          {data.objective}
        </p>
      )}

      {/* 联系方式 */}
      <div style={{ marginBottom: '6mm' }}>
        <h2 style={{ fontSize: '9pt', fontWeight: 600, margin: '0 0 3mm', paddingBottom: '2mm', borderBottom: '1px solid rgba(255,255,255,0.2)', color: '#63b3ed' }}>
          联系方式
        </h2>
        <div style={{ fontSize: '7.5pt', lineHeight: '1.8' }}>
          {data.contact?.phone && <div>📱 {data.contact.phone}</div>}
          {data.contact?.email && <div>✉ {data.contact.email}</div>}
          {data.contact?.location && <div>⌖ {data.contact.location}</div>}
        </div>
      </div>

      {/* 技能 */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: '6mm' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, margin: '0 0 3mm', paddingBottom: '2mm', borderBottom: '1px solid rgba(255,255,255,0.2)', color: '#63b3ed' }}>
            专业技能
          </h2>
          {data.skills.map((skill, i) => (
            <div key={i} style={{ marginBottom: '3mm' }}>
              <div style={{ fontSize: '8pt', fontWeight: 500, marginBottom: '1mm', color: '#90cdf4' }}>{skill.category}</div>
              <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
                {skill.items.join(' / ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 证书 */}
      {data.certifications && data.certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, margin: '0 0 3mm', paddingBottom: '2mm', borderBottom: '1px solid rgba(255,255,255,0.2)', color: '#63b3ed' }}>
            证书资质
          </h2>
          <div style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7' }}>
            {data.certifications.map((cert, i) => (
              <div key={i}>◆ {cert}</div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* 右侧主内容 */}
    <div style={{ flex: 1, padding: '10mm 8mm' }}>
      {/* 个人简介 */}
      {data.summary && (
        <section style={{ marginBottom: '6mm' }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#1a365d', margin: '0 0 3mm', paddingBottom: '2mm', borderBottom: '2px solid #1a365d' }}>
            个人简介
          </h2>
          <p style={{ fontSize: '8.5pt', color: '#4a5568', lineHeight: '1.7', margin: 0 }}>{data.summary}</p>
        </section>
      )}

      {/* 工作经历 */}
      {data.experience && data.experience.length > 0 && (
        <section style={{ marginBottom: '6mm' }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#1a365d', margin: '0 0 4mm', paddingBottom: '2mm', borderBottom: '2px solid #1a365d' }}>
            工作经历
          </h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '5mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '10pt', color: '#2d3748' }}>{exp.company}</strong>
                <span style={{ fontSize: '8pt', color: '#718096' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div style={{ fontSize: '8.5pt', color: '#4a5568', marginBottom: '2mm', fontStyle: 'italic' }}>{exp.position}</div>
              <div style={{ fontSize: '8.5pt', color: '#4a5568', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
            </div>
          ))}
        </section>
      )}

      {/* 项目经验 */}
      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '6mm' }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#1a365d', margin: '0 0 4mm', paddingBottom: '2mm', borderBottom: '2px solid #1a365d' }}>
            项目经验
          </h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '4mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '9.5pt', color: '#2d3748' }}>{proj.name}</strong>
                <span style={{ fontSize: '8pt', color: '#718096' }}>{proj.startDate} - {proj.endDate}</span>
              </div>
              {proj.tech && <div style={{ fontSize: '7.5pt', color: '#63b3ed', marginBottom: '1mm' }}>{proj.tech.join(' / ')}</div>}
              <div style={{ fontSize: '8.5pt', color: '#4a5568', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
            </div>
          ))}
        </section>
      )}

      {/* 教育背景 */}
      {data.education && data.education.length > 0 && (
        <section>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#1a365d', margin: '0 0 4mm', paddingBottom: '2mm', borderBottom: '2px solid #1a365d' }}>
            教育背景
          </h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '3mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '9.5pt', color: '#2d3748' }}>{edu.school}</strong>
                <span style={{ fontSize: '8pt', color: '#718096' }}>{edu.startDate} - {edu.endDate}</span>
              </div>
              <div style={{ fontSize: '8.5pt', color: '#4a5568' }}>
                {edu.degree} · {edu.major}
                {edu.gpa && <span style={{ marginLeft: '4mm' }}>GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  </div>
));
ClassicTemplate.displayName = 'ClassicTemplate';

// ========== 模板2: 现代简约 (Modern) - 清新蓝 ==========
export const ModernTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"SF Pro Display", "-apple-system", "PingFang SC", sans-serif', color: '#1a202c', background: '#f7fafc' }}>
    {/* 顶部头部 */}
    <div style={{ background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', padding: '8mm 10mm', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6mm' }}>
        <div style={{ width: '22mm', height: '22mm', borderRadius: '4mm', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20pt', fontWeight: 700 }}>
          {(data.name || 'Z').charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: '18pt', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>{data.name || '张三'}</h1>
          {data.objective && <p style={{ fontSize: '9pt', margin: '2mm 0 0', opacity: 0.9 }}>{data.objective}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8mm', fontSize: '8pt', marginTop: '4mm', opacity: 0.9 }}>
        {data.contact?.phone && <span>📱 {data.contact.phone}</span>}
        {data.contact?.email && <span>✉ {data.contact.email}</span>}
        {data.contact?.location && <span>⌖ {data.contact.location}</span>}
      </div>
    </div>

    {/* 内容区 */}
    <div style={{ padding: '6mm 10mm' }}>
      {/* 个人简介 */}
      {data.summary && (
        <section style={{ marginBottom: '5mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '3mm' }}>
            <div style={{ width: '3mm', height: '3mm', background: '#3182ce', borderRadius: '50%' }} />
            <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#2d3748', margin: 0 }}>关于我</h2>
          </div>
          <p style={{ fontSize: '8.5pt', color: '#4a5568', lineHeight: '1.7', margin: 0, paddingLeft: '5mm' }}>{data.summary}</p>
        </section>
      )}

      {/* 工作经历 */}
      {data.experience && data.experience.length > 0 && (
        <section style={{ marginBottom: '5mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '3mm' }}>
            <div style={{ width: '3mm', height: '3mm', background: '#3182ce', borderRadius: '50%' }} />
            <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#2d3748', margin: 0 }}>工作经历</h2>
          </div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '4mm', paddingLeft: '5mm', borderLeft: '2px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '9.5pt', color: '#2d3748' }}>{exp.company}</strong>
                <span style={{ fontSize: '7.5pt', color: '#a0aec0' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div style={{ fontSize: '8pt', color: '#3182ce', marginBottom: '2mm' }}>{exp.position}</div>
              <div style={{ fontSize: '8pt', color: '#4a5568', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
            </div>
          ))}
        </section>
      )}

      {/* 项目经验 */}
      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '5mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '3mm' }}>
            <div style={{ width: '3mm', height: '3mm', background: '#3182ce', borderRadius: '50%' }} />
            <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#2d3748', margin: 0 }}>项目经验</h2>
          </div>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '4mm', paddingLeft: '5mm', borderLeft: '2px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '9.5pt', color: '#2d3748' }}>{proj.name}</strong>
                <span style={{ fontSize: '7.5pt', color: '#a0aec0' }}>{proj.startDate} - {proj.endDate}</span>
              </div>
              {proj.tech && <div style={{ fontSize: '7.5pt', color: '#38a169', marginBottom: '1mm' }}>{proj.tech.join(' · ')}</div>}
              <div style={{ fontSize: '8pt', color: '#4a5568', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
            </div>
          ))}
        </section>
      )}

      {/* 教育与技能 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm' }}>
        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '3mm' }}>
              <div style={{ width: '3mm', height: '3mm', background: '#3182ce', borderRadius: '50%' }} />
              <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#2d3748', margin: 0 }}>教育背景</h2>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '3mm' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '8.5pt', color: '#2d3748' }}>{edu.school}</strong>
                  <span style={{ fontSize: '7.5pt', color: '#a0aec0' }}>{edu.endDate}</span>
                </div>
                <div style={{ fontSize: '7.5pt', color: '#4a5568' }}>{edu.degree} · {edu.major}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能 */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '3mm' }}>
              <div style={{ width: '3mm', height: '3mm', background: '#3182ce', borderRadius: '50%' }} />
              <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#2d3748', margin: 0 }}>专业技能</h2>
            </div>
            {data.skills.map((skill, i) => (
              <div key={i} style={{ marginBottom: '2mm' }}>
                <div style={{ fontSize: '7.5pt', fontWeight: 500, color: '#2d3748', marginBottom: '1mm' }}>{skill.category}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5mm' }}>
                  {skill.items.map((item, j) => (
                    <span key={j} style={{ fontSize: '6.5pt', padding: '1mm 2mm', background: '#edf2f7', borderRadius: '1mm', color: '#4a5568' }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* 证书 */}
      {data.certifications && data.certifications.length > 0 && (
        <section style={{ marginTop: '5mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '3mm' }}>
            <div style={{ width: '3mm', height: '3mm', background: '#3182ce', borderRadius: '50%' }} />
            <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#2d3748', margin: 0 }}>证书资质</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3mm', paddingLeft: '5mm' }}>
            {data.certifications.map((cert, i) => (
              <span key={i} style={{ fontSize: '7.5pt', padding: '1.5mm 3mm', background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', borderRadius: '2mm', color: '#fff' }}>
                {cert}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  </div>
));
ModernTemplate.displayName = 'ModernTemplate';

// ========== 模板3: 极简英文 (Minimal) ==========
export const MinimalTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: '#222', background: '#fff', padding: '12mm 14mm' }}>
    {/* 头部 */}
    <div style={{ textAlign: 'center', marginBottom: '10mm' }}>
      <h1 style={{ fontSize: '28pt', fontWeight: 200, margin: '0 0 3mm', letterSpacing: '6px', textTransform: 'uppercase', color: '#111' }}>
        {data.name || 'Zhang Wei'}
      </h1>
      {data.objective && (
        <p style={{ fontSize: '10pt', color: '#666', margin: '0 0 4mm', letterSpacing: '1px' }}>{data.objective}</p>
      )}
      <div style={{ fontSize: '9pt', color: '#999' }}>
        {data.contact?.phone} · {data.contact?.email} · {data.contact?.location}
      </div>
    </div>

    {/* 分隔线 */}
    <div style={{ height: '1px', background: '#e5e5e5', margin: '0 auto 8mm', width: '30%' }} />

    {data.summary && (
      <section style={{ marginBottom: '8mm' }}>
        <h2 style={{ fontSize: '8pt', fontWeight: 400, color: '#999', marginBottom: '4mm', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
          Profile
        </h2>
        <p style={{ fontSize: '10pt', textAlign: 'center', color: '#444', lineHeight: '1.8', margin: 0 }}>{data.summary}</p>
      </section>
    )}

    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: '8mm' }}>
        <h2 style={{ fontSize: '8pt', fontWeight: 400, color: '#999', marginBottom: '5mm', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
          Experience
        </h2>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '6mm' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
              <strong style={{ fontWeight: 600, fontSize: '11pt', color: '#111' }}>{exp.company}</strong>
              <span style={{ color: '#999', fontSize: '9pt' }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <div style={{ fontSize: '9pt', color: '#666', marginBottom: '2mm' }}>{exp.position}</div>
            <div style={{ fontSize: '9.5pt', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
          </div>
        ))}
      </section>
    )}

    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: '8mm' }}>
        <h2 style={{ fontSize: '8pt', fontWeight: 400, color: '#999', marginBottom: '5mm', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
          Projects
        </h2>
        {data.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: '5mm' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
              <strong style={{ fontWeight: 600, fontSize: '11pt', color: '#111' }}>{proj.name}</strong>
              <span style={{ color: '#999', fontSize: '9pt' }}>{proj.startDate} — {proj.endDate}</span>
            </div>
            {proj.tech && <div style={{ fontSize: '8.5pt', color: '#999', marginBottom: '2mm' }}>{proj.tech.join(' / ')}</div>}
            <div style={{ fontSize: '9.5pt', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
          </div>
        ))}
      </section>
    )}

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10mm' }}>
      {data.education && data.education.length > 0 && (
        <section>
          <h2 style={{ fontSize: '8pt', fontWeight: 400, color: '#999', marginBottom: '4mm', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
            Education
          </h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '4mm', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: '10pt' }}>{edu.school}</div>
              <div style={{ fontSize: '9pt', color: '#666' }}>{edu.degree}, {edu.major}</div>
              <div style={{ fontSize: '8pt', color: '#999' }}>{edu.startDate} — {edu.endDate}</div>
            </div>
          ))}
        </section>
      )}

      {data.skills && data.skills.length > 0 && (
        <section>
          <h2 style={{ fontSize: '8pt', fontWeight: 400, color: '#999', marginBottom: '4mm', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
            Skills
          </h2>
          {data.skills.map((skill, i) => (
            <div key={i} style={{ fontSize: '9pt', marginBottom: '2mm', textAlign: 'center' }}>
              <span style={{ color: '#111' }}>{skill.category}:</span> <span style={{ color: '#666' }}>{skill.items.join(', ')}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  </div>
));
MinimalTemplate.displayName = 'MinimalTemplate';

// ========== 模板4: 商务精英 (Executive) - 高端深色 ==========
export const ExecutiveTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif', color: '#e2e8f0', background: '#1a202c', display: 'flex' }}>
    {/* 左侧深色栏 */}
    <div style={{ width: '65mm', background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)', padding: '8mm 6mm' }}>
      {/* 头像 */}
      <div style={{ width: '24mm', height: '24mm', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', margin: '0 auto 5mm', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22pt', fontWeight: 700, color: '#1a202c' }}>
        {(data.name || 'Z').charAt(0)}
      </div>
      
      <h1 style={{ fontSize: '14pt', fontWeight: 700, textAlign: 'center', margin: '0 0 2mm', letterSpacing: '1px', color: '#fff' }}>
        {data.name || '张三'}
      </h1>
      {data.objective && (
        <p style={{ fontSize: '7.5pt', textAlign: 'center', color: '#fbbf24', margin: '0 0 5mm' }}>{data.objective}</p>
      )}

      {/* 联系方式 */}
      <div style={{ marginBottom: '5mm' }}>
        <h2 style={{ fontSize: '8pt', fontWeight: 600, color: '#fbbf24', marginBottom: '2mm', letterSpacing: '1px' }}>CONTACT</h2>
        <div style={{ fontSize: '7pt', lineHeight: '1.9', color: '#8b949e' }}>
          {data.contact?.phone && <div>{data.contact.phone}</div>}
          {data.contact?.email && <div>{data.contact.email}</div>}
          {data.contact?.location && <div>{data.contact.location}</div>}
        </div>
      </div>

      {/* 技能 */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: '5mm' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 600, color: '#fbbf24', marginBottom: '2mm', letterSpacing: '1px' }}>SKILLS</h2>
          {data.skills.map((skill, i) => (
            <div key={i} style={{ marginBottom: '2mm' }}>
              <div style={{ fontSize: '7.5pt', fontWeight: 500, color: '#58a6ff', marginBottom: '1mm' }}>{skill.category}</div>
              <div style={{ fontSize: '7pt', color: '#8b949e', lineHeight: '1.6' }}>{skill.items.join(' · ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* 证书 */}
      {data.certifications && data.certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '8pt', fontWeight: 600, color: '#fbbf24', marginBottom: '2mm', letterSpacing: '1px' }}>CERTIFICATIONS</h2>
          <div style={{ fontSize: '7pt', color: '#8b949e', lineHeight: '1.8' }}>
            {data.certifications.map((cert, i) => <div key={i}>◆ {cert}</div>)}
          </div>
        </div>
      )}
    </div>

    {/* 右侧内容 */}
    <div style={{ flex: 1, padding: '8mm 8mm', background: '#0d1117' }}>
      {/* 个人简介 */}
      {data.summary && (
        <section style={{ marginBottom: '6mm' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#fbbf24', marginBottom: '3mm', paddingBottom: '2mm', borderBottom: '1px solid #30363d' }}>
            ABOUT ME
          </h2>
          <p style={{ fontSize: '8pt', color: '#c9d1d9', lineHeight: '1.7', margin: 0 }}>{data.summary}</p>
        </section>
      )}

      {/* 工作经历 */}
      {data.experience && data.experience.length > 0 && (
        <section style={{ marginBottom: '6mm' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#fbbf24', marginBottom: '4mm', paddingBottom: '2mm', borderBottom: '1px solid #30363d' }}>
            EXPERIENCE
          </h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '5mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '9.5pt', color: '#58a6ff' }}>{exp.company}</strong>
                <span style={{ fontSize: '7.5pt', color: '#8b949e' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div style={{ fontSize: '8pt', color: '#fbbf24', marginBottom: '2mm' }}>{exp.position}</div>
              <div style={{ fontSize: '7.5pt', color: '#c9d1d9', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
            </div>
          ))}
        </section>
      )}

      {/* 项目 */}
      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '6mm' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#fbbf24', marginBottom: '4mm', paddingBottom: '2mm', borderBottom: '1px solid #30363d' }}>
            PROJECTS
          </h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '4mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '9pt', color: '#58a6ff' }}>{proj.name}</strong>
                <span style={{ fontSize: '7.5pt', color: '#8b949e' }}>{proj.startDate} - {proj.endDate}</span>
              </div>
              {proj.tech && <div style={{ fontSize: '7pt', color: '#f0883e', marginBottom: '1mm' }}>{proj.tech.join(' / ')}</div>}
              <div style={{ fontSize: '7.5pt', color: '#c9d1d9', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
            </div>
          ))}
        </section>
      )}

      {/* 教育 */}
      {data.education && data.education.length > 0 && (
        <section>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#fbbf24', marginBottom: '4mm', paddingBottom: '2mm', borderBottom: '1px solid #30363d' }}>
            EDUCATION
          </h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '3mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '9pt', color: '#58a6ff' }}>{edu.school}</strong>
                <span style={{ fontSize: '7.5pt', color: '#8b949e' }}>{edu.startDate} - {edu.endDate}</span>
              </div>
              <div style={{ fontSize: '7.5pt', color: '#c9d1d9' }}>{edu.degree} · {edu.major}</div>
            </div>
          ))}
        </section>
      )}
    </div>
  </div>
));
ExecutiveTemplate.displayName = 'ExecutiveTemplate';

// ========== 模板5: 创意活力 (Creative) ==========
export const CreativeTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif', color: '#1a1a1a', background: '#fafafa' }}>
    {/* 渐变头部 */}
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '8mm 10mm', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* 装饰 */}
      <div style={{ position: 'absolute', top: '-10mm', right: '-10mm', width: '50mm', height: '50mm', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ position: 'absolute', bottom: '-15mm', left: '20%', width: '80mm', height: '80mm', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '6mm', position: 'relative' }}>
        <div style={{ width: '20mm', height: '20mm', borderRadius: '4mm', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18pt', fontWeight: 700 }}>
          {(data.name || 'Z').charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: '18pt', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>{data.name || '张三'}</h1>
          {data.objective && <p style={{ fontSize: '9pt', margin: '2mm 0 0', opacity: 0.9 }}>{data.objective}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6mm', fontSize: '8pt', marginTop: '4mm', opacity: 0.9 }}>
        {data.contact?.phone && <span>📱 {data.contact.phone}</span>}
        {data.contact?.email && <span>✉ {data.contact.email}</span>}
        {data.contact?.location && <span>📍 {data.contact.location}</span>}
      </div>
    </div>

    {/* 内容 */}
    <div style={{ padding: '6mm 10mm' }}>
      {data.summary && (
        <section style={{ marginBottom: '5mm', background: '#fff', padding: '4mm 5mm', borderRadius: '3mm', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#667eea', margin: '0 0 2mm' }}>💫 关于我</h2>
          <p style={{ fontSize: '8.5pt', color: '#4a5568', lineHeight: '1.7', margin: 0 }}>{data.summary}</p>
        </section>
      )}

      {data.experience && data.experience.length > 0 && (
        <section style={{ marginBottom: '5mm' }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#667eea', marginBottom: '3mm' }}>💼 工作经历</h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ background: '#fff', padding: '4mm 5mm', borderRadius: '3mm', marginBottom: '3mm', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '3px solid #764ba2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '9.5pt', color: '#1a1a1a' }}>{exp.company}</strong>
                <span style={{ fontSize: '7.5pt', color: '#a0aec0' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div style={{ fontSize: '8pt', color: '#764ba2', marginBottom: '2mm' }}>{exp.position}</div>
              <div style={{ fontSize: '8pt', color: '#4a5568', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
            </div>
          ))}
        </section>
      )}

      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '5mm' }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#667eea', marginBottom: '3mm' }}>🚀 项目经验</h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ background: '#fff', padding: '4mm 5mm', borderRadius: '3mm', marginBottom: '3mm', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '3px solid #f093fb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '9.5pt', color: '#1a1a1a' }}>{proj.name}</strong>
                <span style={{ fontSize: '7.5pt', color: '#a0aec0' }}>{proj.startDate} - {proj.endDate}</span>
              </div>
              {proj.tech && <div style={{ fontSize: '7.5pt', color: '#764ba2', marginBottom: '1mm' }}>{proj.tech.join(' · ')}</div>}
              <div style={{ fontSize: '8pt', color: '#4a5568', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
            </div>
          ))}
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4mm' }}>
        {data.education && data.education.length > 0 && (
          <section style={{ background: '#fff', padding: '4mm', borderRadius: '3mm', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#667eea', marginBottom: '3mm' }}>🎓 教育背景</h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '2mm' }}>
                <div style={{ fontSize: '8.5pt', fontWeight: 500 }}>{edu.school}</div>
                <div style={{ fontSize: '7.5pt', color: '#718096' }}>{edu.degree} · {edu.major}</div>
              </div>
            ))}
          </section>
        )}

        {data.skills && data.skills.length > 0 && (
          <section style={{ background: '#fff', padding: '4mm', borderRadius: '3mm', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#667eea', marginBottom: '3mm' }}>⚡ 技能特长</h2>
            {data.skills.map((skill, i) => (
              <div key={i} style={{ marginBottom: '2mm' }}>
                <div style={{ fontSize: '7.5pt', fontWeight: 500, color: '#4a5568', marginBottom: '1mm' }}>{skill.category}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5mm' }}>
                  {skill.items.map((item, j) => (
                    <span key={j} style={{ fontSize: '6.5pt', padding: '1mm 2mm', background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)', borderRadius: '2mm', color: '#667eea' }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  </div>
));
CreativeTemplate.displayName = 'CreativeTemplate';

// ========== 模板6: 科技未来 (Tech) ==========
export const TechTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace', color: '#00ff88', background: '#0d1117' }}>
    {/* 头部 */}
    <div style={{ padding: '8mm', borderBottom: '1px solid #30363d' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5mm' }}>
        <div style={{ width: '18mm', height: '18mm', borderRadius: '3mm', background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16pt', fontWeight: 700, color: '#0d1117' }}>
          {(data.name || 'Z').charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: '16pt', fontWeight: 700, margin: 0, color: '#fff' }}>{data.name || 'Zhang Wei'}</h1>
          <p style={{ fontSize: '8pt', color: '#00ff88', margin: '1mm 0 0' }}>{data.objective || 'Software Engineer'}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6mm', fontSize: '7.5pt', color: '#8b949e', marginTop: '3mm' }}>
        {data.contact?.phone && <span>{data.contact.phone}</span>}
        {data.contact?.email && <span>{data.contact.email}</span>}
        {data.contact?.location && <span>{data.contact.location}</span>}
      </div>
    </div>

    {/* 内容 */}
    <div style={{ padding: '6mm 8mm' }}>
      {data.summary && (
        <section style={{ marginBottom: '5mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '2mm' }}>
            <span style={{ color: '#ff7b72' }}>//</span>
            <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#fff', margin: 0 }}>about_me</h2>
          </div>
          <p style={{ fontSize: '8pt', color: '#8b949e', lineHeight: '1.7', margin: 0, paddingLeft: '4mm' }}>{data.summary}</p>
        </section>
      )}

      {data.experience && data.experience.length > 0 && (
        <section style={{ marginBottom: '5mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '3mm' }}>
            <span style={{ color: '#ff7b72' }}>//</span>
            <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#fff', margin: 0 }}>work_experience</h2>
          </div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '4mm', paddingLeft: '4mm', borderLeft: '2px solid #30363d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <strong style={{ color: '#79c0ff', fontSize: '9pt' }}>{exp.company}</strong>
                <span style={{ color: '#484f58', fontSize: '7.5pt' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div style={{ color: '#00ff88', fontSize: '7.5pt', marginBottom: '2mm' }}>{exp.position}</div>
              <div style={{ color: '#8b949e', fontSize: '7.5pt', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
            </div>
          ))}
        </section>
      )}

      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '5mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '3mm' }}>
            <span style={{ color: '#ff7b72' }}>//</span>
            <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#fff', margin: 0 }}>projects</h2>
          </div>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '4mm', paddingLeft: '4mm', borderLeft: '2px solid #30363d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <strong style={{ color: '#d2a8ff', fontSize: '9pt' }}>{proj.name}</strong>
                <span style={{ color: '#484f58', fontSize: '7.5pt' }}>{proj.startDate} - {proj.endDate}</span>
              </div>
              {proj.tech && <div style={{ color: '#79c0ff', fontSize: '7pt', marginBottom: '1mm' }}>[{proj.tech.join(', ')}]</div>}
              <div style={{ color: '#8b949e', fontSize: '7.5pt', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
            </div>
          ))}
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5mm' }}>
        {data.education && data.education.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '2mm' }}>
              <span style={{ color: '#ff7b72' }}>//</span>
              <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#fff', margin: 0 }}>education</h2>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '2mm', paddingLeft: '4mm', borderLeft: '2px solid #30363d' }}>
                <div style={{ color: '#79c0ff', fontSize: '8pt' }}>{edu.school}</div>
                <div style={{ color: '#8b949e', fontSize: '7.5pt' }}>{edu.degree} · {edu.major}</div>
              </div>
            ))}
          </section>
        )}

        {data.skills && data.skills.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '2mm' }}>
              <span style={{ color: '#ff7b72' }}>//</span>
              <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#fff', margin: 0 }}>skills</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2mm', paddingLeft: '4mm' }}>
              {data.skills.flatMap(s => s.items).map((skill, i) => (
                <span key={i} style={{ fontSize: '6.5pt', padding: '1mm 2mm', background: '#161b22', border: '1px solid #30363d', borderRadius: '1mm', color: '#00ff88' }}>{skill}</span>
              ))}
            </div>
          </section>
        )}
      </div>

      {data.certifications && data.certifications.length > 0 && (
        <section style={{ marginTop: '5mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '2mm' }}>
            <span style={{ color: '#ff7b72' }}>//</span>
            <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#fff', margin: 0 }}>certifications</h2>
          </div>
          <div style={{ paddingLeft: '4mm', fontSize: '7.5pt', color: '#8b949e' }}>
            {data.certifications.join(' | ')}
          </div>
        </section>
      )}
    </div>
  </div>
));
TechTemplate.displayName = 'TechTemplate';

// ========== 模板7: 优雅复古 (Elegant) ==========
export const ElegantTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"Georgia", "Times New Roman", serif', color: '#3d3d3d', background: '#fdfcf9', display: 'flex' }}>
    {/* 左侧装饰栏 */}
    <div style={{ width: '8mm', background: 'linear-gradient(180deg, #8b7355 0%, #a08060 100%)' }} />

    {/* 主内容 */}
    <div style={{ flex: 1, padding: '10mm 12mm' }}>
      {/* 头部 */}
      <div style={{ textAlign: 'center', marginBottom: '8mm', paddingBottom: '6mm', borderBottom: '1px solid #d4c4a8' }}>
        <h1 style={{ fontSize: '22pt', fontWeight: 400, fontStyle: 'italic', margin: '0 0 3mm', color: '#2d2d2d', letterSpacing: '2px' }}>
          {data.name || 'Zhang Wei'}
        </h1>
        {data.objective && (
          <p style={{ fontSize: '10pt', color: '#8b7355', margin: '0 0 4mm', fontStyle: 'italic', letterSpacing: '1px' }}>{data.objective}</p>
        )}
        <div style={{ fontSize: '8.5pt', color: '#8b7355' }}>
          {data.contact?.phone} ◆ {data.contact?.email} ◆ {data.contact?.location}
        </div>
      </div>

      {data.summary && (
        <section style={{ marginBottom: '8mm', textAlign: 'center' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 400, color: '#8b7355', marginBottom: '4mm', textTransform: 'uppercase', letterSpacing: '3px' }}>
            Profile
          </h2>
          <p style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#5a5a5a', lineHeight: '1.8', margin: 0 }}>{data.summary}</p>
        </section>
      )}

      {data.experience && data.experience.length > 0 && (
        <section style={{ marginBottom: '8mm' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 400, color: '#8b7355', marginBottom: '5mm', paddingBottom: '2mm', borderBottom: '1px solid #d4c4a8', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
            Experience
          </h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '6mm', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4mm', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '10pt', fontStyle: 'italic', color: '#2d2d2d' }}>{exp.company}</strong>
                <span style={{ fontSize: '9pt', color: '#8b7355' }}>{exp.startDate} — {exp.endDate}</span>
              </div>
              <div style={{ fontSize: '8.5pt', color: '#8b7355', fontStyle: 'italic', marginBottom: '2mm' }}>{exp.position}</div>
              <div style={{ fontSize: '9pt', color: '#5a5a5a', lineHeight: '1.7', textAlign: 'justify' }}>{exp.description}</div>
            </div>
          ))}
        </section>
      )}

      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '8mm' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 400, color: '#8b7355', marginBottom: '5mm', paddingBottom: '2mm', borderBottom: '1px solid #d4c4a8', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}>
            Projects
          </h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '5mm', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4mm', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '10pt', fontStyle: 'italic', color: '#2d2d2d' }}>{proj.name}</strong>
                <span style={{ fontSize: '9pt', color: '#8b7355' }}>{proj.startDate} — {proj.endDate}</span>
              </div>
              {proj.tech && <div style={{ fontSize: '8pt', color: '#8b7355', marginBottom: '2mm' }}>{proj.tech.join(' / ')}</div>}
              <div style={{ fontSize: '9pt', color: '#5a5a5a', lineHeight: '1.7', textAlign: 'justify' }}>{proj.description}</div>
            </div>
          ))}
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm' }}>
        {data.education && data.education.length > 0 && (
          <section style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '9pt', fontWeight: 400, color: '#8b7355', marginBottom: '4mm', paddingBottom: '2mm', borderBottom: '1px solid #d4c4a8', textTransform: 'uppercase', letterSpacing: '3px' }}>
              Education
            </h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '3mm' }}>
                <div style={{ fontSize: '9.5pt', fontStyle: 'italic' }}>{edu.school}</div>
                <div style={{ fontSize: '8.5pt', color: '#8b7355' }}>{edu.degree}, {edu.major}</div>
                <div style={{ fontSize: '8pt', color: '#999' }}>{edu.startDate} — {edu.endDate}</div>
              </div>
            ))}
          </section>
        )}

        {data.skills && data.skills.length > 0 && (
          <section style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '9pt', fontWeight: 400, color: '#8b7355', marginBottom: '4mm', paddingBottom: '2mm', borderBottom: '1px solid #d4c4a8', textTransform: 'uppercase', letterSpacing: '3px' }}>
              Skills
            </h2>
            {data.skills.map((skill, i) => (
              <div key={i} style={{ marginBottom: '2mm', fontSize: '8.5pt' }}>
                <span style={{ color: '#2d2d2d' }}>{skill.category}:</span> <span style={{ color: '#8b7355' }}>{skill.items.join(', ')}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  </div>
));
ElegantTemplate.displayName = 'ElegantTemplate';

// ========== 模板8: 创业风格 (Startup) ==========
export const StartupTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} style={{ ...A4, fontFamily: '"Inter", "-apple-system", "PingFang SC", sans-serif', color: '#111827', background: '#fff' }}>
    {/* 头部 - 橙色渐变 */}
    <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', padding: '8mm 10mm', color: '#fff', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20pt', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{data.name || '张三'}</h1>
          {data.objective && <p style={{ fontSize: '9pt', margin: '2mm 0 0', opacity: 0.9 }}>{data.objective}</p>}
        </div>
        <div style={{ textAlign: 'right', fontSize: '8pt', opacity: 0.9 }}>
          <div>{data.contact?.phone}</div>
          <div>{data.contact?.email}</div>
          <div>{data.contact?.location}</div>
        </div>
      </div>
    </div>

    {/* 蓝色细条 */}
    <div style={{ height: '3px', background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)' }} />

    {/* 内容 */}
    <div style={{ padding: '6mm 10mm' }}>
      {data.summary && (
        <section style={{ marginBottom: '5mm' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#f97316', marginBottom: '3mm', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ✦ Summary
          </h2>
          <p style={{ fontSize: '8.5pt', color: '#374151', lineHeight: '1.7', margin: 0 }}>{data.summary}</p>
        </section>
      )}

      {data.experience && data.experience.length > 0 && (
        <section style={{ marginBottom: '5mm' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#f97316', marginBottom: '3mm', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ✦ Experience
          </h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '4mm', paddingLeft: '4mm', borderLeft: '3px solid #fed7aa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '9.5pt', color: '#111827' }}>{exp.company}</strong>
                <span style={{ fontSize: '7.5pt', color: '#9ca3af' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div style={{ fontSize: '8pt', color: '#3b82f6', marginBottom: '2mm' }}>{exp.position}</div>
              <div style={{ fontSize: '8pt', color: '#374151', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
            </div>
          ))}
        </section>
      )}

      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '5mm' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#f97316', marginBottom: '3mm', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ✦ Projects
          </h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '4mm', paddingLeft: '4mm', borderLeft: '3px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                <strong style={{ fontSize: '9.5pt', color: '#111827' }}>{proj.name}</strong>
                <span style={{ fontSize: '7.5pt', color: '#9ca3af' }}>{proj.startDate} - {proj.endDate}</span>
              </div>
              {proj.tech && <div style={{ fontSize: '7.5pt', color: '#3b82f6', marginBottom: '1mm' }}>{proj.tech.join(' · ')}</div>}
              <div style={{ fontSize: '8pt', color: '#374151', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
            </div>
          ))}
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5mm' }}>
        {data.education && data.education.length > 0 && (
          <section>
            <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#f97316', marginBottom: '3mm', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ✦ Education
            </h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '3mm' }}>
                <div style={{ fontSize: '9pt', fontWeight: 500 }}>{edu.school}</div>
                <div style={{ fontSize: '8pt', color: '#6b7280' }}>{edu.degree} · {edu.major}</div>
              </div>
            ))}
          </section>
        )}

        {data.skills && data.skills.length > 0 && (
          <section>
            <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#f97316', marginBottom: '3mm', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ✦ Skills
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2mm' }}>
              {data.skills.flatMap(s => s.items).map((skill, i) => (
                <span key={i} style={{ fontSize: '7pt', padding: '1.5mm 3mm', background: '#fff7ed', borderRadius: '2mm', color: '#ea580c', border: '1px solid #fed7aa' }}>{skill}</span>
              ))}
            </div>
          </section>
        )}
      </div>

      {data.certifications && data.certifications.length > 0 && (
        <section style={{ marginTop: '5mm' }}>
          <h2 style={{ fontSize: '9pt', fontWeight: 600, color: '#f97316', marginBottom: '3mm', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ✦ Certifications
          </h2>
          <div style={{ fontSize: '8pt', color: '#374151' }}>{data.certifications.join(' · ')}</div>
        </section>
      )}
    </div>
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
  classic: { name: '经典商务', description: '蓝色双栏布局，专业稳重', component: ClassicTemplate, tags: ['双栏', '专业'] },
  modern: { name: '现代简约', description: '清新蓝白，层次分明', component: ModernTemplate, tags: ['清新', '活力'] },
  minimal: { name: '极简英文', description: '大量留白，国际风格', component: MinimalTemplate, tags: ['极简', '国际'] },
  executive: { name: '商务精英', description: '深色科技风，高端大气', component: ExecutiveTemplate, tags: ['深色', '高端'] },
  creative: { name: '创意活力', description: '紫粉渐变，活泼多彩', component: CreativeTemplate, tags: ['创意', '多彩'] },
  tech: { name: '科技未来', description: '终端代码风，技术感强', component: TechTemplate, tags: ['程序员', '代码'] },
  elegant: { name: '优雅复古', description: '羊皮纸风格，典雅大气', component: ElegantTemplate, tags: ['优雅', '经典'] },
  startup: { name: '创业风格', description: '橙蓝双色，简洁有力', component: StartupTemplate, tags: ['创业', '活力'] },
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
