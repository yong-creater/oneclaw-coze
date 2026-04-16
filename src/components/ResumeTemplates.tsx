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
  summary?: string; // 个人简介
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
    achievements?: string[]; // 关键成就
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

// 模板类型
export type ResumeTemplateType = 
  | 'classic'      // 经典商务
  | 'modern'       // 现代简约
  | 'minimal'      // 极简英文
  | 'executive'    // 商务精英
  | 'creative'     // 创意活力
  | 'tech'         // 科技未来
  | 'elegant'      // 优雅复古
  | 'startup';     // 创业风格

// A4尺寸样式
const A4_STYLE = {
  width: '210mm',
  minHeight: '297mm',
  padding: '15mm 16mm',
  background: '#ffffff',
  fontSize: '9.5pt',
  lineHeight: '1.5',
};

// ==================== 模板1: 经典商务 ====================
export const ClassicTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: '"Georgia", "Times New Roman", serif',
          color: '#2d3748',
        }}
      >
        {/* 头部 */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '18px', 
          paddingBottom: '15px', 
          borderBottom: '2px solid #2d3748' 
        }}>
          <h1 style={{ 
            fontSize: '26pt', 
            fontWeight: 'bold', 
            margin: '0 0 6px 0', 
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#1a202c'
          }}>
            {data.name || '张三'}
          </h1>
          {data.objective && (
            <p style={{ 
              fontSize: '10pt', 
              color: '#4a5568', 
              margin: '0 0 10px 0',
              fontStyle: 'italic'
            }}>{data.objective}</p>
          )}
          <div style={{ fontSize: '9pt', color: '#718096' }}>
            {data.contact?.phone}  |  {data.contact?.email}  |  {data.contact?.location}
          </div>
        </div>

        {/* 个人简介 */}
        {data.summary && (
          <section style={{ marginBottom: '16px' }}>
            <h2 style={{ 
              fontSize: '11pt', 
              fontWeight: 'bold', 
              borderBottom: '1px solid #cbd5e0', 
              paddingBottom: '4px', 
              marginBottom: '10px',
              color: '#1a202c'
            }}>
              个人简介
            </h2>
            <p style={{ margin: 0, fontSize: '9.5pt', color: '#4a5568' }}>{data.summary}</p>
          </section>
        )}

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <h2 style={{ 
              fontSize: '11pt', 
              fontWeight: 'bold', 
              borderBottom: '1px solid #cbd5e0', 
              paddingBottom: '4px', 
              marginBottom: '10px',
              color: '#1a202c'
            }}>
              教育背景
            </h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10pt', color: '#1a202c' }}>{edu.school}</strong>
                  <span style={{ fontSize: '9pt', color: '#718096' }}>{edu.startDate} - {edu.endDate}</span>
                </div>
                <div style={{ fontSize: '9pt', color: '#4a5568' }}>
                  {edu.degree} · {edu.major}
                  {edu.gpa && <span> · GPA: {edu.gpa}</span>}
                  {edu.honors && <span> · {edu.honors}</span>}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <h2 style={{ 
              fontSize: '11pt', 
              fontWeight: 'bold', 
              borderBottom: '1px solid #cbd5e0', 
              paddingBottom: '4px', 
              marginBottom: '10px',
              color: '#1a202c'
            }}>
              工作经历
            </h2>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10pt', color: '#1a202c' }}>{exp.company}</strong>
                  <span style={{ fontSize: '9pt', color: '#718096' }}>{exp.startDate} - {exp.endDate}</span>
                </div>
                <div style={{ fontSize: '9pt', color: '#4a5568', fontStyle: 'italic', marginBottom: '4px' }}>
                  {exp.position}
                </div>
                <div style={{ fontSize: '9.5pt', whiteSpace: 'pre-wrap', color: '#2d3748' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目经验 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <h2 style={{ 
              fontSize: '11pt', 
              fontWeight: 'bold', 
              borderBottom: '1px solid #cbd5e0', 
              paddingBottom: '4px', 
              marginBottom: '10px',
              color: '#1a202c'
            }}>
              项目经验
            </h2>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10pt', color: '#1a202c' }}>{proj.name}</strong>
                  <span style={{ fontSize: '9pt', color: '#718096' }}>{proj.startDate} - {proj.endDate}</span>
                </div>
                {proj.tech && (
                  <div style={{ fontSize: '8.5pt', color: '#718096', marginBottom: '2px' }}>
                    技术栈: {proj.tech.join(' / ')}
                  </div>
                )}
                <div style={{ fontSize: '9.5pt', whiteSpace: 'pre-wrap', color: '#2d3748' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能与证书 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {data.skills && data.skills.length > 0 && (
            <section>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                borderBottom: '1px solid #cbd5e0', 
                paddingBottom: '4px', 
                marginBottom: '10px',
                color: '#1a202c'
              }}>
                技能特长
              </h2>
              {data.skills.map((skill, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <strong style={{ fontSize: '9pt', color: '#2d3748' }}>{skill.category}:</strong>
                  <span style={{ fontSize: '9pt', color: '#4a5568' }}> {skill.items.join('、')}</span>
                </div>
              ))}
            </section>
          )}
          {data.certifications && data.certifications.length > 0 && (
            <section>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                borderBottom: '1px solid #cbd5e0', 
                paddingBottom: '4px', 
                marginBottom: '10px',
                color: '#1a202c'
              }}>
                证书资质
              </h2>
              {data.certifications.map((cert, i) => (
                <div key={i} style={{ fontSize: '9pt', color: '#4a5568', marginBottom: '4px' }}>
                  ◆ {cert}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    );
  }
);
ClassicTemplate.displayName = 'ClassicTemplate';

// ==================== 模板2: 现代简约 ====================
export const ModernTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: '"SF Pro Display", "-apple-system", "BlinkMacSystemFont", "Segoe UI", Roboto, sans-serif',
          color: '#1e293b',
        }}
      >
        {/* 头部 - 左侧色条 */}
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <div style={{ 
            width: '5px', 
            background: 'linear-gradient(180deg, #3b82f6 0%, #06b6d4 100%)',
            marginRight: '14px',
            borderRadius: '3px'
          }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '24pt', 
              fontWeight: 700, 
              margin: '0 0 6px 0', 
              color: '#0f172a',
              letterSpacing: '-0.5px'
            }}>
              {data.name || '张三'}
            </h1>
            {data.objective && (
              <p style={{ fontSize: '10.5pt', color: '#64748b', margin: '0 0 12px 0' }}>{data.objective}</p>
            )}
            <div style={{ display: 'flex', gap: '20px', fontSize: '9pt', color: '#64748b' }}>
              {data.contact?.phone && <span>📱 {data.contact.phone}</span>}
              {data.contact?.email && <span>✉️ {data.contact.email}</span>}
              {data.contact?.location && <span>📍 {data.contact.location}</span>}
            </div>
          </div>
        </div>

        {/* 个人简介 */}
        {data.summary && (
          <section style={{ marginBottom: '16px' }}>
            <h2 style={{ 
              fontSize: '10pt', 
              fontWeight: 600, 
              color: '#3b82f6', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              About Me
            </h2>
            <p style={{ margin: 0, fontSize: '9.5pt', color: '#475569', lineHeight: '1.6' }}>{data.summary}</p>
          </section>
        )}

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <h2 style={{ 
              fontSize: '10pt', 
              fontWeight: 600, 
              color: '#3b82f6', 
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              Education
            </h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ 
                marginBottom: '8px', 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingLeft: '10px',
                borderLeft: '2px solid #e2e8f0'
              }}>
                <div>
                  <strong style={{ fontSize: '10pt', color: '#1e293b' }}>{edu.school}</strong>
                  <span style={{ color: '#64748b', marginLeft: '8px' }}>{edu.degree} · {edu.major}</span>
                  {edu.gpa && <span style={{ color: '#94a3b8', fontSize: '8.5pt' }}> GPA: {edu.gpa}</span>}
                </div>
                <span style={{ fontSize: '9pt', color: '#94a3b8', whiteSpace: 'nowrap' }}>{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <h2 style={{ 
              fontSize: '10pt', 
              fontWeight: 600, 
              color: '#3b82f6', 
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              Experience
            </h2>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10pt', color: '#1e293b' }}>{exp.company}</strong>
                  <span style={{ fontSize: '9pt', color: '#94a3b8' }}>{exp.startDate} - {exp.endDate}</span>
                </div>
                <div style={{ fontSize: '9pt', color: '#64748b', marginBottom: '5px' }}>{exp.position}</div>
                <div style={{ fontSize: '9.5pt', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目经验 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <h2 style={{ 
              fontSize: '10pt', 
              fontWeight: 600, 
              color: '#3b82f6', 
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              Projects
            </h2>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10pt', color: '#1e293b' }}>{proj.name}</strong>
                  <span style={{ fontSize: '9pt', color: '#94a3b8' }}>{proj.startDate} - {proj.endDate}</span>
                </div>
                {proj.tech && (
                  <div style={{ fontSize: '8.5pt', color: '#06b6d4', marginBottom: '2px' }}>
                    {proj.tech.join(' • ')}
                  </div>
                )}
                <div style={{ fontSize: '9.5pt', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能 */}
        {data.skills && data.skills.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <h2 style={{ 
              fontSize: '10pt', 
              fontWeight: 600, 
              color: '#3b82f6', 
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              Skills
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.skills.flatMap(s => s.items).map((skill, i) => (
                <span key={i} style={{ 
                  fontSize: '9pt', 
                  padding: '4px 12px', 
                  background: '#f1f5f9', 
                  borderRadius: '20px', 
                  color: '#475569'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 证书 */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <h2 style={{ 
              fontSize: '10pt', 
              fontWeight: 600, 
              color: '#3b82f6', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              Certifications
            </h2>
            <p style={{ fontSize: '9.5pt', color: '#475569', margin: 0 }}>
              {data.certifications.join('  •  ')}
            </p>
          </section>
        )}
      </div>
    );
  }
);
ModernTemplate.displayName = 'ModernTemplate';

// ==================== 模板3: 极简英文 ====================
export const MinimalTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          color: '#000',
          padding: '20mm 22mm',
        }}
      >
        {/* 头部 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '32pt', 
            fontWeight: 200, 
            margin: '0 0 12px 0', 
            letterSpacing: '6px',
            textTransform: 'uppercase'
          }}>
            {data.name || 'Zhang San'}
          </h1>
          {data.objective && (
            <p style={{ fontSize: '10pt', color: '#666', margin: '0 0 15px 0', letterSpacing: '1px' }}>{data.objective}</p>
          )}
          <div style={{ fontSize: '9pt', color: '#999', letterSpacing: '0.5px' }}>
            {data.contact?.phone}  ·  {data.contact?.email}  ·  {data.contact?.location}
          </div>
        </div>

        {/* 分隔线 */}
        <div style={{ height: '1px', background: '#e0e0e0', margin: '0 auto 25px', width: '60%' }} />

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '22px' }}>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 400, 
              color: '#999', 
              marginBottom: '12px', 
              textTransform: 'uppercase', 
              letterSpacing: '2.5px',
              textAlign: 'center'
            }}>
              Education
            </h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ 
                marginBottom: '10px', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ fontWeight: 500, fontSize: '10.5pt' }}>{edu.school}</strong>
                  <div style={{ color: '#555', fontSize: '9.5pt' }}>
                    {edu.degree}, {edu.major}
                    {edu.gpa && <span> · GPA {edu.gpa}</span>}
                  </div>
                </div>
                <span style={{ color: '#999', fontSize: '9pt', whiteSpace: 'nowrap' }}>{edu.startDate} — {edu.endDate}</span>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '22px' }}>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 400, 
              color: '#999', 
              marginBottom: '12px', 
              textTransform: 'uppercase', 
              letterSpacing: '2.5px',
              textAlign: 'center'
            }}>
              Experience
            </h2>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontWeight: 500, fontSize: '10.5pt' }}>{exp.company}</strong>
                  <span style={{ color: '#999', fontSize: '9pt' }}>{exp.startDate} — {exp.endDate}</span>
                </div>
                <div style={{ fontSize: '9.5pt', color: '#555', marginBottom: '6px', fontStyle: 'italic' }}>{exp.position}</div>
                <div style={{ fontSize: '10pt', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '22px' }}>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 400, 
              color: '#999', 
              marginBottom: '12px', 
              textTransform: 'uppercase', 
              letterSpacing: '2.5px',
              textAlign: 'center'
            }}>
              Projects
            </h2>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontWeight: 500, fontSize: '10.5pt' }}>{proj.name}</strong>
                  <span style={{ color: '#999', fontSize: '9pt' }}>{proj.startDate} — {proj.endDate}</span>
                </div>
                {proj.tech && (
                  <div style={{ fontSize: '8.5pt', color: '#888', marginBottom: '2px', letterSpacing: '0.5px' }}>
                    {proj.tech.join(' / ')}
                  </div>
                )}
                <div style={{ fontSize: '10pt', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能 */}
        {data.skills && data.skills.length > 0 && (
          <section style={{ marginBottom: '22px' }}>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 400, 
              color: '#999', 
              marginBottom: '12px', 
              textTransform: 'uppercase', 
              letterSpacing: '2.5px',
              textAlign: 'center'
            }}>
              Skills
            </h2>
            <p style={{ fontSize: '10pt', textAlign: 'center', lineHeight: '1.8', color: '#333' }}>
              {data.skills.map(s => `${s.category}: ${s.items.join(', ')}`).join('  ·  ')}
            </p>
          </section>
        )}

        {/* 证书 */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 400, 
              color: '#999', 
              marginBottom: '12px', 
              textTransform: 'uppercase', 
              letterSpacing: '2.5px',
              textAlign: 'center'
            }}>
              Certifications
            </h2>
            <p style={{ fontSize: '10pt', textAlign: 'center', color: '#333' }}>
              {data.certifications.join('  ·  ')}
            </p>
          </section>
        )}
      </div>
    );
  }
);
MinimalTemplate.displayName = 'MinimalTemplate';

// ==================== 模板4: 商务精英 ====================
export const ExecutiveTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: '"Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif',
          color: '#1a202c',
        }}
      >
        {/* 深色头部背景 */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
          color: '#fff',
          margin: '-15mm -16mm 20px -16mm',
          padding: '22mm 16mm 18mm 16mm',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 装饰元素 */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            left: '30%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.02)',
          }} />
          
          <h1 style={{ 
            fontSize: '28pt', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            letterSpacing: '4px',
            position: 'relative'
          }}>
            {data.name || '张三'}
          </h1>
          {data.objective && (
            <p style={{ 
              fontSize: '11pt', 
              color: '#a0b4c8', 
              margin: '0 0 15px 0',
              letterSpacing: '1px'
            }}>{data.objective}</p>
          )}
          <div style={{ 
            display: 'flex', 
            gap: '25px', 
            fontSize: '9.5pt', 
            color: '#c9d6e3',
            position: 'relative'
          }}>
            {data.contact?.phone && <span>{data.contact.phone}</span>}
            {data.contact?.email && <span>{data.contact.email}</span>}
            {data.contact?.location && <span>{data.contact.location}</span>}
          </div>
        </div>

        {/* 个人简介 */}
        {data.summary && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ width: '4px', height: '16px', background: '#c9a227', marginRight: '10px', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#1e3a5f' }}>个人简介</h2>
            </div>
            <p style={{ margin: 0, fontSize: '9.5pt', color: '#4a5568', lineHeight: '1.7' }}>{data.summary}</p>
          </section>
        )}

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ width: '4px', height: '16px', background: '#c9a227', marginRight: '10px', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#1e3a5f' }}>教育背景</h2>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: '10pt', color: '#1a202c' }}>{edu.school}</strong>
                  <span style={{ color: '#718096', marginLeft: '10px' }}>{edu.degree} · {edu.major}</span>
                  {edu.honors && <span style={{ color: '#c9a227', fontSize: '9pt', marginLeft: '10px' }}>◆ {edu.honors}</span>}
                </div>
                <span style={{ color: '#a0aec0', fontSize: '9pt' }}>{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ width: '4px', height: '16px', background: '#c9a227', marginRight: '10px', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#1e3a5f' }}>工作经历</h2>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '10.5pt', color: '#1a202c' }}>{exp.company}</strong>
                  <span style={{ color: '#a0aec0', fontSize: '9pt' }}>{exp.startDate} - {exp.endDate}</span>
                </div>
                <div style={{ fontSize: '9.5pt', color: '#c9a227', marginBottom: '6px', fontWeight: 500 }}>{exp.position}</div>
                <div style={{ fontSize: '9.5pt', color: '#4a5568', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目经验 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ width: '4px', height: '16px', background: '#c9a227', marginRight: '10px', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#1e3a5f' }}>项目经验</h2>
            </div>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '10pt', color: '#1a202c' }}>{proj.name}</strong>
                  <span style={{ color: '#a0aec0', fontSize: '9pt' }}>{proj.startDate} - {proj.endDate}</span>
                </div>
                {proj.tech && (
                  <div style={{ fontSize: '8.5pt', color: '#c9a227', marginBottom: '2px' }}>
                    {proj.tech.join(' / ')}
                  </div>
                )}
                <div style={{ fontSize: '9.5pt', color: '#4a5568', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能与证书 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {data.skills && data.skills.length > 0 && (
            <section>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{ width: '4px', height: '16px', background: '#c9a227', marginRight: '10px', borderRadius: '2px' }} />
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#1e3a5f' }}>技能特长</h2>
              </div>
              {data.skills.map((skill, i) => (
                <div key={i} style={{ marginBottom: '6px', fontSize: '9.5pt' }}>
                  <strong style={{ color: '#1a202c' }}>{skill.category}:</strong>
                  <span style={{ color: '#718096' }}> {skill.items.join('、')}</span>
                </div>
              ))}
            </section>
          )}
          {data.certifications && data.certifications.length > 0 && (
            <section>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{ width: '4px', height: '16px', background: '#c9a227', marginRight: '10px', borderRadius: '2px' }} />
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#1e3a5f' }}>证书资质</h2>
              </div>
              {data.certifications.map((cert, i) => (
                <div key={i} style={{ fontSize: '9.5pt', color: '#4a5568', marginBottom: '4px' }}>
                  ◆ {cert}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    );
  }
);
ExecutiveTemplate.displayName = 'ExecutiveTemplate';

// ==================== 模板5: 创意活力 ====================
export const CreativeTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
          color: '#2d3748',
        }}
      >
        {/* 头部 - 渐变背景 */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          margin: '-15mm -16mm 18px -16mm',
          padding: '20mm 16mm',
          position: 'relative'
        }}>
          {/* 装饰圆形 */}
          <div style={{
            position: 'absolute',
            top: '10mm',
            right: '15mm',
            width: '40mm',
            height: '40mm',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20mm',
            color: 'rgba(255,255,255,0.3)'
          }}>
            ✦
          </div>
          
          <h1 style={{ 
            fontSize: '26pt', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            color: '#fff',
            letterSpacing: '2px'
          }}>
            {data.name || '张三'}
          </h1>
          {data.objective && (
            <p style={{ 
              fontSize: '10.5pt', 
              color: 'rgba(255,255,255,0.9)', 
              margin: '0 0 12px 0',
              fontWeight: 300
            }}>{data.objective}</p>
          )}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            fontSize: '9pt', 
            color: 'rgba(255,255,255,0.85)'
          }}>
            {data.contact?.phone && <span>📱 {data.contact.phone}</span>}
            {data.contact?.email && <span>✉️ {data.contact.email}</span>}
            {data.contact?.location && <span>📍 {data.contact.location}</span>}
          </div>
        </div>

        {/* 个人简介 */}
        {data.summary && (
          <section style={{ marginBottom: '14px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
              paddingBottom: '6px',
              borderBottom: '2px dashed #e2e8f0'
            }}>
              <span style={{ fontSize: '14pt', marginRight: '8px' }}>💫</span>
              <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#667eea' }}>关于我</h2>
            </div>
            <p style={{ margin: 0, fontSize: '9.5pt', color: '#4a5568', lineHeight: '1.7' }}>{data.summary}</p>
          </section>
        )}

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
              paddingBottom: '6px',
              borderBottom: '2px dashed #e2e8f0'
            }}>
              <span style={{ fontSize: '14pt', marginRight: '8px' }}>🎓</span>
              <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#667eea' }}>教育背景</h2>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px', paddingLeft: '10px', borderLeft: '3px solid #f093fb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '10pt', color: '#2d3748' }}>{edu.school}</strong>
                  <span style={{ fontSize: '9pt', color: '#a0aec0' }}>{edu.startDate} - {edu.endDate}</span>
                </div>
                <div style={{ fontSize: '9pt', color: '#718096' }}>
                  {edu.degree} · {edu.major}
                  {edu.honors && <span style={{ color: '#764ba2' }}> · {edu.honors}</span>}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
              paddingBottom: '6px',
              borderBottom: '2px dashed #e2e8f0'
            }}>
              <span style={{ fontSize: '14pt', marginRight: '8px' }}>💼</span>
              <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#667eea' }}>工作经历</h2>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '12px', paddingLeft: '10px', borderLeft: '3px solid #764ba2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '10pt', color: '#2d3748' }}>{exp.company}</strong>
                  <span style={{ fontSize: '9pt', color: '#a0aec0' }}>{exp.startDate} - {exp.endDate}</span>
                </div>
                <div style={{ fontSize: '9pt', color: '#764ba2', marginBottom: '5px', fontWeight: 500 }}>{exp.position}</div>
                <div style={{ fontSize: '9.5pt', color: '#4a5568', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目经验 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
              paddingBottom: '6px',
              borderBottom: '2px dashed #e2e8f0'
            }}>
              <span style={{ fontSize: '14pt', marginRight: '8px' }}>🚀</span>
              <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#667eea' }}>项目经验</h2>
            </div>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px', paddingLeft: '10px', borderLeft: '3px solid #f093fb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '10pt', color: '#2d3748' }}>{proj.name}</strong>
                  <span style={{ fontSize: '9pt', color: '#a0aec0' }}>{proj.startDate} - {proj.endDate}</span>
                </div>
                {proj.tech && (
                  <div style={{ fontSize: '8.5pt', color: '#764ba2', marginBottom: '2px' }}>
                    {proj.tech.join(' • ')}
                  </div>
                )}
                <div style={{ fontSize: '9.5pt', color: '#4a5568', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能 */}
        {data.skills && data.skills.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
              paddingBottom: '6px',
              borderBottom: '2px dashed #e2e8f0'
            }}>
              <span style={{ fontSize: '14pt', marginRight: '8px' }}>⚡</span>
              <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#667eea' }}>技能特长</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.skills.flatMap(s => s.items).map((skill, i) => (
                <span key={i} style={{ 
                  fontSize: '9pt', 
                  padding: '4px 12px', 
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                  borderRadius: '20px', 
                  color: '#667eea',
                  border: '1px solid rgba(102,126,234,0.2)'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 证书 */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
              paddingBottom: '6px',
              borderBottom: '2px dashed #e2e8f0'
            }}>
              <span style={{ fontSize: '14pt', marginRight: '8px' }}>🏆</span>
              <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: 0, color: '#667eea' }}>证书资质</h2>
            </div>
            <p style={{ fontSize: '9.5pt', color: '#4a5568', margin: 0 }}>
              {data.certifications.join('  ·  ')}
            </p>
          </section>
        )}
      </div>
    );
  }
);
CreativeTemplate.displayName = 'CreativeTemplate';

// ==================== 模板6: 科技未来 ====================
export const TechTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
          color: '#00ff88',
          background: '#0a0a0f',
        }}
      >
        {/* 头部 */}
        <div style={{ 
          marginBottom: '20px', 
          paddingBottom: '15px',
          borderBottom: '1px solid #00ff8820'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28pt',
              color: '#0a0a0f',
              fontWeight: 'bold'
            }}>
              {data.name?.charAt(0) || 'Z'}
            </div>
            <div>
              <h1 style={{ 
                fontSize: '24pt', 
                fontWeight: 700, 
                margin: 0, 
                color: '#ffffff',
                letterSpacing: '-0.5px'
              }}>
                {data.name || 'Zhang San'}
              </h1>
              <p style={{ fontSize: '9.5pt', color: '#00ff88', margin: '4px 0 0 0' }}>{data.objective || 'Software Engineer'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '9pt', color: '#888' }}>
            {data.contact?.phone && <span>{data.contact.phone}</span>}
            {data.contact?.email && <span>{data.contact.email}</span>}
            {data.contact?.location && <span>{data.contact.location}</span>}
          </div>
        </div>

        {/* 个人简介 */}
        {data.summary && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#00ff88' }}>//</span>
              <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>About</h2>
            </div>
            <p style={{ margin: 0, fontSize: '9.5pt', color: '#888', lineHeight: '1.7' }}>{data.summary}</p>
          </section>
        )}

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#00ff88' }}>//</span>
              <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>Education</h2>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px', paddingLeft: '15px', borderLeft: '2px solid #00ff8840' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#00ff88', fontSize: '10pt' }}>{edu.school}</strong>
                  <span style={{ color: '#555', fontSize: '9pt' }}>{edu.startDate} - {edu.endDate}</span>
                </div>
                <div style={{ color: '#888', fontSize: '9pt' }}>
                  {edu.degree} · {edu.major}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#00ff88' }}>//</span>
              <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>Experience</h2>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '12px', paddingLeft: '15px', borderLeft: '2px solid #00d4ff40' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#00d4ff', fontSize: '10pt' }}>{exp.company}</strong>
                  <span style={{ color: '#555', fontSize: '9pt' }}>{exp.startDate} - {exp.endDate}</span>
                </div>
                <div style={{ color: '#00ff88', fontSize: '9pt', marginBottom: '5px' }}>{exp.position}</div>
                <div style={{ color: '#888', fontSize: '9.5pt', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目经验 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#00ff88' }}>//</span>
              <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>Projects</h2>
            </div>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px', paddingLeft: '15px', borderLeft: '2px solid #ff00ff40' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#ff00ff', fontSize: '10pt' }}>{proj.name}</strong>
                  <span style={{ color: '#555', fontSize: '9pt' }}>{proj.startDate} - {proj.endDate}</span>
                </div>
                {proj.tech && (
                  <div style={{ color: '#ff00ff', fontSize: '8.5pt', marginBottom: '2px', opacity: 0.7 }}>
                    [{proj.tech.join(', ')}]
                  </div>
                )}
                <div style={{ color: '#888', fontSize: '9.5pt', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能 */}
        {data.skills && data.skills.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#00ff88' }}>//</span>
              <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>Skills</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.skills.flatMap(s => s.items).map((skill, i) => (
                <span key={i} style={{ 
                  fontSize: '9pt', 
                  padding: '3px 10px', 
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

        {/* 证书 */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#00ff88' }}>//</span>
              <h2 style={{ fontSize: '10pt', fontWeight: 600, margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>Certs</h2>
            </div>
            <p style={{ fontSize: '9.5pt', color: '#888', margin: 0 }}>
              {data.certifications.join('  |  ')}
            </p>
          </section>
        )}
      </div>
    );
  }
);
TechTemplate.displayName = 'TechTemplate';

// ==================== 模板7: 优雅复古 ====================
export const ElegantTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif',
          color: '#3d3d3d',
          background: '#fefcf8',
        }}
      >
        {/* 装饰边框 */}
        <div style={{
          position: 'absolute',
          top: '10mm',
          left: '10mm',
          right: '10mm',
          bottom: '10mm',
          border: '1px solid #d4c4a8',
          pointerEvents: 'none'
        }} />

        {/* 头部 */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px', 
          paddingBottom: '18px',
          borderBottom: '2px solid #8b7355'
        }}>
          <h1 style={{ 
            fontSize: '28pt', 
            fontWeight: 'normal', 
            margin: '0 0 8px 0', 
            color: '#2d2d2d',
            fontStyle: 'italic',
            letterSpacing: '3px'
          }}>
            {data.name || '张三'}
          </h1>
          {data.objective && (
            <p style={{ 
              fontSize: '10pt', 
              color: '#6b6b6b', 
              margin: '0 0 12px 0',
              fontStyle: 'italic',
              letterSpacing: '1px'
            }}>{data.objective}</p>
          )}
          <div style={{ 
            fontSize: '9pt', 
            color: '#8b7355',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px'
          }}>
            {data.contact?.phone}  ◆  {data.contact?.email}  ◆  {data.contact?.location}
          </div>
        </div>

        {/* 个人简介 */}
        {data.summary && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '12px'
            }}>
              <span style={{ 
                fontSize: '11pt', 
                fontWeight: 'normal', 
                color: '#8b7355',
                textTransform: 'uppercase',
                letterSpacing: '4px'
              }}>Profile</span>
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: '9.5pt', 
              color: '#5a5a5a', 
              lineHeight: '1.8',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>{data.summary}</p>
          </section>
        )}

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid #d4c4a8'
            }}>
              <span style={{ 
                fontSize: '11pt', 
                fontWeight: 'normal', 
                color: '#8b7355',
                textTransform: 'uppercase',
                letterSpacing: '4px'
              }}>Education</span>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} style={{ 
                marginBottom: '10px', 
                textAlign: 'center'
              }}>
                <strong style={{ fontSize: '10.5pt', color: '#3d3d3d' }}>{edu.school}</strong>
                <div style={{ fontSize: '9pt', color: '#6b6b6b', fontStyle: 'italic' }}>
                  {edu.degree}, {edu.major}  ·  {edu.startDate} - {edu.endDate}
                </div>
                {edu.honors && (
                  <div style={{ fontSize: '9pt', color: '#8b7355' }}>{edu.honors}</div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid #d4c4a8'
            }}>
              <span style={{ 
                fontSize: '11pt', 
                fontWeight: 'normal', 
                color: '#8b7355',
                textTransform: 'uppercase',
                letterSpacing: '4px'
              }}>Experience</span>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '10.5pt', color: '#3d3d3d', fontStyle: 'italic' }}>{exp.company}</strong>
                  <span style={{ color: '#8b7355', fontSize: '9pt', fontStyle: 'italic' }}>{exp.startDate} - {exp.endDate}</span>
                </div>
                <div style={{ 
                  fontSize: '9.5pt', 
                  color: '#6b6b6b', 
                  marginBottom: '6px',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>{exp.position}</div>
                <div style={{ 
                  fontSize: '9.5pt', 
                  color: '#5a5a5a', 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: '1.7',
                  textAlign: 'justify'
                }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid #d4c4a8'
            }}>
              <span style={{ 
                fontSize: '11pt', 
                fontWeight: 'normal', 
                color: '#8b7355',
                textTransform: 'uppercase',
                letterSpacing: '4px'
              }}>Projects</span>
            </div>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '10pt', color: '#3d3d3d', fontStyle: 'italic' }}>{proj.name}</strong>
                  <span style={{ color: '#8b7355', fontSize: '9pt', fontStyle: 'italic' }}>{proj.startDate} - {proj.endDate}</span>
                </div>
                {proj.tech && (
                  <div style={{ fontSize: '8.5pt', color: '#8b7355', marginBottom: '2px' }}>
                    {proj.tech.join(' / ')}
                  </div>
                )}
                <div style={{ fontSize: '9.5pt', color: '#5a5a5a', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能 */}
        {data.skills && data.skills.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid #d4c4a8'
            }}>
              <span style={{ 
                fontSize: '11pt', 
                fontWeight: 'normal', 
                color: '#8b7355',
                textTransform: 'uppercase',
                letterSpacing: '4px'
              }}>Skills</span>
            </div>
            <p style={{ 
              fontSize: '9.5pt', 
              color: '#5a5a5a', 
              textAlign: 'center',
              lineHeight: '1.8'
            }}>
              {data.skills.map(s => `${s.category}: ${s.items.join(', ')}`).join('  ·  ')}
            </p>
          </section>
        )}

        {/* 证书 */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid #d4c4a8'
            }}>
              <span style={{ 
                fontSize: '11pt', 
                fontWeight: 'normal', 
                color: '#8b7355',
                textTransform: 'uppercase',
                letterSpacing: '4px'
              }}>Certifications</span>
            </div>
            <p style={{ 
              fontSize: '9.5pt', 
              color: '#5a5a5a', 
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              {data.certifications.join('  ·  ')}
            </p>
          </section>
        )}
      </div>
    );
  }
);
ElegantTemplate.displayName = 'ElegantTemplate';

// ==================== 模板8: 创业风格 ====================
export const StartupTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...A4_STYLE,
          fontFamily: '"Inter", "-apple-system", "BlinkMacSystemFont", sans-serif',
          color: '#111827',
        }}
      >
        {/* 头部 - 双色块 */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '18px',
          minHeight: '70px'
        }}>
          <div style={{ 
            width: '8px', 
            background: '#f97316',
            borderRadius: '4px',
            marginRight: '14px'
          }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '26pt', 
              fontWeight: 800, 
              margin: '0 0 6px 0', 
              color: '#111827',
              letterSpacing: '-1px'
            }}>
              {data.name || '张三'}
            </h1>
            {data.objective && (
              <p style={{ fontSize: '10pt', color: '#6b7280', margin: '0 0 10px 0' }}>{data.objective}</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '9pt', color: '#9ca3af' }}>
              {data.contact?.phone && <span>{data.contact.phone}</span>}
              {data.contact?.email && <span>{data.contact.email}</span>}
              {data.contact?.location && <span>{data.contact.location}</span>}
            </div>
          </div>
          <div style={{ 
            width: '8px', 
            background: '#3b82f6',
            borderRadius: '4px'
          }} />
        </div>

        {/* 个人简介 */}
        {data.summary && (
          <section style={{ marginBottom: '14px' }}>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 600, 
              color: '#f97316', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ✦ Summary
            </h2>
            <p style={{ margin: 0, fontSize: '9.5pt', color: '#374151', lineHeight: '1.65' }}>{data.summary}</p>
          </section>
        )}

        {/* 教育背景 */}
        {data.education && data.education.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 600, 
              color: '#f97316', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ✦ Education
            </h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ 
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <strong style={{ fontSize: '10pt', color: '#111827' }}>{edu.school}</strong>
                  <span style={{ color: '#6b7280', marginLeft: '8px' }}>{edu.degree} · {edu.major}</span>
                </div>
                <span style={{ fontSize: '9pt', color: '#9ca3af', whiteSpace: 'nowrap' }}>{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </section>
        )}

        {/* 工作经历 */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 600, 
              color: '#f97316', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ✦ Experience
            </h2>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '10pt', color: '#111827' }}>{exp.company}</strong>
                  <span style={{ fontSize: '9pt', color: '#9ca3af' }}>{exp.startDate} - {exp.endDate}</span>
                </div>
                <div style={{ fontSize: '9pt', color: '#3b82f6', marginBottom: '5px', fontWeight: 500 }}>{exp.position}</div>
                <div style={{ fontSize: '9.5pt', color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 项目 */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 600, 
              color: '#f97316', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ✦ Projects
            </h2>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '10pt', color: '#111827' }}>{proj.name}</strong>
                  <span style={{ fontSize: '9pt', color: '#9ca3af' }}>{proj.startDate} - {proj.endDate}</span>
                </div>
                {proj.tech && (
                  <div style={{ fontSize: '8.5pt', color: '#3b82f6', marginBottom: '2px' }}>
                    {proj.tech.join(' • ')}
                  </div>
                )}
                <div style={{ fontSize: '9.5pt', color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{proj.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* 技能 */}
        {data.skills && data.skills.length > 0 && (
          <section style={{ marginBottom: '14px' }}>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 600, 
              color: '#f97316', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ✦ Skills
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.skills.flatMap(s => s.items).map((skill, i) => (
                <span key={i} style={{ 
                  fontSize: '9pt', 
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

        {/* 证书 */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <h2 style={{ 
              fontSize: '9pt', 
              fontWeight: 600, 
              color: '#f97316', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ✦ Certifications
            </h2>
            <p style={{ fontSize: '9.5pt', color: '#374151', margin: 0 }}>
              {data.certifications.join('  •  ')}
            </p>
          </section>
        )}
      </div>
    );
  }
);
StartupTemplate.displayName = 'StartupTemplate';

// ==================== 模板映射 ====================
export const templates: Record<ResumeTemplateType, {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  preview: string;
  tags: string[];
}> = {
  classic: {
    name: '经典商务',
    description: '传统稳重型，适合国企/传统行业',
    component: ClassicTemplate,
    preview: 'bg-slate-100',
    tags: ['传统', '稳重'],
  },
  modern: {
    name: '现代简约',
    description: '清新活力型，适合互联网/科技公司',
    component: ModernTemplate,
    preview: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    tags: ['现代', '清新'],
  },
  minimal: {
    name: '极简英文',
    description: '简洁国际型，适合外企/海归背景',
    component: MinimalTemplate,
    preview: 'bg-white',
    tags: ['英文', '极简'],
  },
  executive: {
    name: '商务精英',
    description: '稳重专业型，适合咨询/金融/管理岗',
    component: ExecutiveTemplate,
    preview: 'bg-gradient-to-br from-slate-800 to-slate-900',
    tags: ['精英', '深色'],
  },
  creative: {
    name: '创意活力',
    description: '活泼多彩型，适合创意/设计/运营岗',
    component: CreativeTemplate,
    preview: 'bg-gradient-to-br from-purple-500 to-pink-500',
    tags: ['创意', '活泼'],
  },
  tech: {
    name: '科技未来',
    description: '赛博朋克型，适合程序员/技术岗',
    component: TechTemplate,
    preview: 'bg-black',
    tags: ['程序员', '科技'],
  },
  elegant: {
    name: '优雅复古',
    description: '典雅大气型，适合管理/咨询/法律',
    component: ElegantTemplate,
    preview: 'bg-gradient-to-br from-amber-50 to-stone-100',
    tags: ['优雅', '复古'],
  },
  startup: {
    name: '创业风格',
    description: '简洁有力型，适合创业公司/Startup',
    component: StartupTemplate,
    preview: 'bg-gradient-to-br from-orange-100 to-blue-100',
    tags: ['创业', '简洁'],
  },
};

// ==================== 简历预览组件 ====================
export function ResumePreview({ 
  template, 
  data 
}: { 
  template: ResumeTemplateType; 
  data: ResumeData;
}) {
  const TemplateComponent = templates[template]?.component;
  if (!TemplateComponent) return null;
  return <TemplateComponent data={data} />;
}

// ==================== 简历模板选择器 ====================
interface ResumeTemplateSelectorProps {
  selectedTemplate: ResumeTemplateType;
  onSelect: (template: ResumeTemplateType) => void;
}

export function ResumeTemplateSelector({ selectedTemplate, onSelect }: ResumeTemplateSelectorProps) {
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

// 生成示例数据
export function generateSampleResumeData(): ResumeData {
  return {
    name: '张伟',
    contact: {
      phone: '138-1234-5678',
      email: 'zhangwei@example.com',
      location: '北京·海淀区',
    },
    objective: '高级前端开发工程师',
    summary: '8年前端开发经验，擅长React/Vue生态，主导过多个DAU千万级产品。具备优秀的技术架构能力和团队协作能力。',
    education: [
      {
        school: '北京理工大学',
        degree: '硕士',
        major: '计算机科学与技术',
        gpa: '3.8/4.0',
        honors: '优秀毕业生',
        startDate: '2013.09',
        endDate: '2016.06',
      },
      {
        school: '北京航空航天大学',
        degree: '学士',
        major: '软件工程',
        startDate: '2009.09',
        endDate: '2013.06',
      },
    ],
    experience: [
      {
        company: '字节跳动',
        position: '前端架构组 / 高级前端工程师',
        startDate: '2020.03',
        endDate: '至今',
        description: '• 主导抖音直播中台系统建设，日活用户2000万+\n• 设计低延迟直播流媒体播放器，首屏时间从3.2s优化至0.8s\n• 搭建集团级前端监控平台，覆盖98%业务线',
      },
      {
        company: '阿里巴巴',
        position: '淘宝前端技术部 / 前端工程师',
        startDate: '2017.07',
        endDate: '2020.02',
        description: '• 主导商家工作台从jQuery迁移至React，迁移200+页面\n• 设计微前端架构方案，开发效率提升50%\n• 性能优化专项：首屏加载从4.5s降至1.2s',
      },
    ],
    projects: [
      {
        name: '企业级低代码平台',
        role: '技术负责人',
        tech: ['React', 'TypeScript', 'Monaco Editor'],
        startDate: '2022.01',
        endDate: '2022.12',
        description: '设计拖拽式页面搭建引擎，支持100+业务组件，月活开发者500+，产能提升3倍。',
      },
      {
        name: '前端智能监控平台',
        role: '核心开发',
        tech: ['Vue3', 'WebSocket', 'ClickHouse'],
        startDate: '2021.03',
        endDate: '2021.12',
        description: '前端错误监控、性能采集、用户行为分析三位一体，告警准确率95%。',
      },
    ],
    skills: [
      { category: '前端框架', items: ['React', 'Vue', 'Angular', 'Next.js'] },
      { category: '工程化', items: ['Webpack', 'Vite', 'TypeScript', 'Turborepo'] },
      { category: '后端', items: ['Node.js', 'Python', 'Go'] },
    ],
    certifications: [
      'AWS Certified Solutions Architect',
      'Google Cloud Professional Developer',
    ],
  };
}
