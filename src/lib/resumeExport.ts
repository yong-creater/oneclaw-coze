import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeData, ResumeTemplateType, templates } from '@/components/tools/ResumeTemplates';

/**
 * 将简历DOM转换为PDF并下载
 */
export async function exportResumeToPDF(
  elementId: string,
  filename: string = '简历'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('简历元素未找到');
  }

  try {
    // 将DOM转换为canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 提高清晰度
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // 计算PDF尺寸 (A4: 210mm x 297mm)
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // 创建PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 添加图片
    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 如果内容超过一页，添加更多页面
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 下载PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF导出失败:', error);
    throw error;
  }
}

/**
 * 从AI优化内容解析简历数据
 */
export function parseResumeFromAI(content: string): ResumeData {
  const data: ResumeData = {
    name: '',
    contact: {},
    objective: '',
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
  };

  // 提取姓名（第一个标题行）
  const nameMatch = content.match(/^#+\s*([^\n#]+)/m);
  if (nameMatch) {
    data.name = nameMatch[1].trim();
  }

  // 提取联系信息
  const phoneMatch = content.match(/1[3-9]\d{9}/);
  const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
  const locationMatch = content.match(/[\u4e00-\u9fa5]{2,6}[市省区]/);
  
  if (phoneMatch) data.contact!.phone = phoneMatch[0];
  if (emailMatch) data.contact!.email = emailMatch[0];
  if (locationMatch) data.contact!.location = locationMatch[0];

  // 提取求职意向
  const objectiveMatch = content.match(/求职意向[：:]\s*([^\n]+)/);
  if (objectiveMatch) {
    data.objective = objectiveMatch[1].trim();
  }

  // 提取教育背景
  const educationSection = content.match(/教育背景[\s\S]*?(?=工作经历|项目经验|技能|$)/i);
  if (educationSection) {
    const eduMatches = educationSection[0].matchAll(/([^-\n]+)\s*[-–]\s*([^-\n]+)\s*[-–]\s*([^\n]+)/g);
    for (const match of eduMatches) {
      data.education!.push({
        school: match[1].trim(),
        degree: match[2].trim(),
        major: match[3].trim(),
      });
    }
  }

  // 提取工作经历
  const experienceSection = content.match(/工作经历[\s\S]*?(?=项目经验|技能|$)/i);
  if (experienceSection) {
    const lines = experienceSection[0].split('\n');
    let currentExp: {
      company?: string;
      position?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    } = {};
    
    for (const line of lines) {
      const companyMatch = line.match(/【?公司】?\s*(.+?)(?:\s*[-–|\s]|$)/);
      const positionMatch = line.match(/【?职位】?\s*(.+?)(?:\s*[-–|\s]|$)/);
      const descMatch = line.match(/^[•\-*]\s*(.+)/);
      
      if (companyMatch) {
        if (currentExp.company) {
          data.experience!.push({
            company: currentExp.company,
            position: currentExp.position || '',
            startDate: currentExp.startDate,
            endDate: currentExp.endDate,
            description: currentExp.description || '',
          });
        }
        currentExp = { company: companyMatch[1].trim() };
      } else if (positionMatch) {
        currentExp.position = positionMatch[1].trim();
      } else if (descMatch) {
        currentExp.description = (currentExp.description || '') + descMatch[1].trim() + '\n';
      }
    }
    
    if (currentExp.company) {
      data.experience!.push({
        company: currentExp.company,
        position: currentExp.position || '',
        startDate: currentExp.startDate,
        endDate: currentExp.endDate,
        description: currentExp.description || '',
      });
    }
  }

  // 提取项目经验
  const projectSection = content.match(/项目经验[\s\S]*?(?=技能|证书|$)/i);
  if (projectSection) {
    const lines = projectSection[0].split('\n');
    let currentProj: {
      name?: string;
      role?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    } = {};
    
    for (const line of lines) {
      const nameMatch = line.match(/【?项目】?\s*(.+?)(?:\s*[-–|\s]|$)/);
      const descMatch = line.match(/^[•\-*]\s*(.+)/);
      
      if (nameMatch) {
        if (currentProj.name) {
          data.projects!.push({
            name: currentProj.name,
            role: currentProj.role,
            startDate: currentProj.startDate,
            endDate: currentProj.endDate,
            description: currentProj.description || '',
          });
        }
        currentProj = { name: nameMatch[1].trim() };
      } else if (descMatch) {
        currentProj.description = (currentProj.description || '') + descMatch[1].trim() + '\n';
      }
    }
    
    if (currentProj.name) {
      data.projects!.push({
        name: currentProj.name,
        role: currentProj.role,
        startDate: currentProj.startDate,
        endDate: currentProj.endDate,
        description: currentProj.description || '',
      });
    }
  }

  // 提取技能
  const skillMatch = content.match(/技能[：:]\s*([^\n]+)/);
  if (skillMatch) {
    const skillItems = skillMatch[1].split(/[,，、|]/).map(s => s.trim()).filter(Boolean);
    data.skills = [{ category: '技能', items: skillItems }];
  }

  // 提取证书
  const certMatch = content.match(/证书[：:]\s*([^\n]+)/);
  if (certMatch) {
    data.certifications = certMatch[1].split(/[,，、|]/).map(s => s.trim()).filter(Boolean);
  }

  return data;
}

/**
 * 生成示例简历数据
 */
export function generateSampleResumeData(): ResumeData {
  return {
    name: '李明',
    contact: {
      phone: '138-0013-8000',
      email: 'liming@example.com',
      location: '北京市朝阳区',
    },
    objective: '寻求高级前端开发工程师岗位，专注React生态与技术架构',
    education: [
      {
        school: '北京理工大学',
        degree: '硕士',
        major: '计算机科学与技术',
        startDate: '2018-09',
        endDate: '2021-06',
      },
      {
        school: '北京航空航天大学',
        degree: '学士',
        major: '软件工程',
        startDate: '2014-09',
        endDate: '2018-06',
      },
    ],
    experience: [
      {
        company: '字节跳动',
        position: '高级前端开发工程师',
        startDate: '2021-07',
        endDate: '至今',
        description: `• 主导核心业务系统技术升级，引入React+TypeScript重构，代码质量提升60%
• 搭建前端工程化体系，集成CI/CD流程，部署效率提升300%
• 优化首屏加载性能，Lighthouse评分从58提升至92
• 培养团队技术氛围，组织技术分享10+场次`,
      },
      {
        company: '阿里巴巴',
        position: '前端开发工程师',
        startDate: '2019-03',
        endDate: '2021-06',
        description: `• 负责电商后台管理系统开发，支撑日均UV 50万+
• 封装通用业务组件库，覆盖80%常用场景
• 主导性能优化专项，首屏加载时间降低45%`,
      },
    ],
    projects: [
      {
        name: '低代码可视化编辑器',
        role: '核心开发',
        startDate: '2023-01',
        endDate: '2023-06',
        description: `• 设计拖拽式页面搭建引擎，支持50+组件
• 实现JSON配置到React组件的动态渲染
• 产出的低代码平台已服务内部10+团队`,
      },
      {
        name: '前端监控平台',
        role: '技术负责人',
        startDate: '2022-06',
        endDate: '2022-12',
        description: `• 设计前端错误监控与性能采集方案
• 基于WebSocket实现实时告警推送
• 监控平台已覆盖公司全部前端项目`,
      },
    ],
    skills: [
      { category: '前端框架', items: ['React', 'Vue', 'Angular'] },
      { category: '语言', items: ['TypeScript', 'JavaScript', 'Node.js'] },
      { category: '工具', items: ['Webpack', 'Vite', 'Docker'] },
    ],
    certifications: [
      'AWS Certified Developer',
      'PMP项目管理专业人士',
    ],
  };
}
