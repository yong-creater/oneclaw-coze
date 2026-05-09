import BackToHome from '@/components/site/common/BackToHome';
import WechatPromo from '@/components/site/common/WechatPromo';

export const metadata = {
  title: '关于 OneClaw - AI 商业内容生成平台',
  description: 'OneClaw 专注于 AI 商业内容生成，帮助电商卖家、内容创作者和普通用户，用更简单的方式生成高质量内容。',
};

export default function AboutPage() {
  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <BackToHome />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* 标题 */}
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: 'rgba(20,20,20,0.85)',
          letterSpacing: '-0.02em',
          marginBottom: 32,
        }}>
          关于 OneClaw
        </h1>

        {/* 简介 */}
        <div style={{
          padding: '28px 32px',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          border: '1px solid rgba(120,120,255,0.08)',
          marginBottom: 24,
        }}>
          <p style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: 'rgba(20,20,20,0.65)',
            marginBottom: 16,
          }}>
            OneClaw 专注于 AI 商业内容生成，帮助电商卖家、内容创作者和普通用户，用更简单的方式生成可发布、可使用的高质量内容。
          </p>
          <p style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: 'rgba(20,20,20,0.65)',
          }}>
            我们相信，AI 技术应当让创作变得更容易，而不是更复杂。OneClaw 的使命是让每个人都能像专业设计师一样，快速产出商业级视觉内容。
          </p>
        </div>

        {/* 平台能力 */}
        <div style={{
          padding: '28px 32px',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          border: '1px solid rgba(120,120,255,0.08)',
          marginBottom: 24,
        }}>
          <h2 style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'rgba(20,20,20,0.72)',
            marginBottom: 16,
          }}>
            平台当前支持
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {[
              { icon: '🛍️', label: 'AI 商品图', desc: '上传商品照片，一键生成电商主图、白底图、场景图' },
              { icon: '📱', label: '小红书内容', desc: '生成小红书爆款封面和种草笔记配图' },
              { icon: '📸', label: 'AI 写真', desc: '上传人像照片，生成高级质感 AI 写真大片' },
              { icon: '🎨', label: '海报封面', desc: '快速生成活动海报、社交媒体封面图' },
              { icon: '📄', label: '商品详情页', desc: '自动排版生成商品详情页长图' },
              { icon: '✂️', label: '图片处理工具', desc: '智能抠图、去背景、图片重绘等实用功能' },
            ].map((item) => (
              <li key={item.label} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '8px 0',
              }}>
                <span style={{ fontSize: 18, lineHeight: 1.2 }}>{item.icon}</span>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(20,20,20,0.72)' }}>{item.label}</span>
                  <span style={{ fontSize: 13, color: 'rgba(20,20,20,0.4)', marginLeft: 8 }}>{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 联系方式 */}
        <div style={{
          padding: '28px 32px',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          border: '1px solid rgba(120,120,255,0.08)',
        }}>
          <h2 style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'rgba(20,20,20,0.72)',
            marginBottom: 12,
          }}>
            联系我们
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(20,20,20,0.5)' }}>
            如有任何问题或合作需求，欢迎通过以下方式联系我们：
          </p>
          <p style={{ fontSize: 14, color: 'rgba(20,20,20,0.5)', marginTop: 8 }}>
            邮箱：1017760688@qq.com
          </p>
          <p style={{ fontSize: 14, color: 'rgba(20,20,20,0.5)', marginTop: 4 }}>
            关注微信公众号，获取最新 AI 创作技巧和平台更新。
          </p>
        </div>
      </div>
      <WechatPromo />
    </div>
  );
}
