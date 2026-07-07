import { ResumeData, ResumeStyles } from "./types";

export const CURATED_AVATARS = [
  { id: 'avatar1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150', name: '商务女士 1' },
  { id: 'avatar2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150', name: '商务男士 1' },
  { id: 'avatar3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150', name: '商务女士 2' },
  { id: 'avatar4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150', name: '商务男士 2' },
  { id: 'avatar5', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150', name: '专业女性学者' },
  { id: 'avatar6', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150', name: '创意男设计师' },
];

export const INDUSTRY_TEMPLATES: Record<string, { name: string; category: string; data: ResumeData; styles: ResumeStyles }> = {
  ui_designer: {
    name: "UI设计师",
    category: "设计与创意",
    styles: {
      template: 'modern',
      primaryColor: '#2563eb', // Blue 600
      textColor: '#1e293b',
      fontSize: 'sm',
      fontFamily: 'sans',
      spacing: 'normal',
      layout: 'two-column-right',
      showAvatar: true,
    },
    data: {
      personalInfo: {
        name: "陈斯宇",
        title: "资深 UI/UX 设计师",
        email: "chen_siyu@example.com",
        phone: "138-0123-4567",
        location: "上海·黄浦",
        website: "zcool.com.cn/u/siyu_design",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
      },
      summary: "5年数字产品设计经验，专注复杂 B 端系统与 C 端创新产品的界面及体验设计。精通 Design System 规范体系搭建与跨端高效协作，致力于用理性的栅格与感性的光影平衡业务价值与用户体验。",
      experiences: [
        {
          id: "exp1",
          company: "星河科技集团",
          position: "资深 UI/UX 设计师",
          startDate: "2023-05",
          endDate: "至今",
          description: "• 负责星河云监控平台 2.0 体验重构，建立全局设计系统规范，降低开发重构返工率 35%。\n• 深度重塑监控数据大盘，优化多维信息的呈现层级，使业务大户检索效率提升 40%。"
        },
        {
          id: "exp2",
          company: "意创互联科技",
          position: "UI 设计师",
          startDate: "2021-03",
          endDate: "2023-04",
          description: "• 负责高保真 C 端电商产品及大促创意活动方案，跨端（iOS/Android/Web）设计交付。\n• 沉淀基础交互组件与高精动效方案，缩短了设计到前端的开发还原周期，让交易转化链路提升 15%。"
        }
      ],
      educations: [
        {
          id: "edu1",
          school: "中国美术学院",
          major: "视觉传达设计",
          degree: "学士",
          startDate: "2017-09",
          endDate: "2021-06",
          description: "GPA 3.8/4.0 绩点第一。曾获全国数字艺术设计大赛金奖、三好学生等荣誉。"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "政企级无人机监管平台",
          role: "G端监管平台 / UI设计师",
          startDate: "2023-09",
          endDate: "2024-02",
          description: "针对存量系统信息层级复杂、视觉规范不统一的问题，主导可视化界面的迭代优化。\n• 梳理了核心告警处置及实时测绘大屏的操作路径，提高多维数据呈现的逻辑连贯性。\n• 设计轻量且对比度极高的深色大盘，将紧急告警信息的响应确认效率提升了 28%。"
        },
        {
          id: "proj2",
          name: "星链电商 Design System 2.0",
          role: "规范制定者 & 核心设计师",
          startDate: "2022-07",
          endDate: "2022-12",
          description: "为规范多业务线交付而启动的组件库重构项目。\n• 基于 Figma Variable 制定无障碍色彩、间距和阴影系统，编写 120 页详尽的体验设计指导手册。"
        }
      ],
      skills: ["Figma / Pixso", "Framer 动效原型", "Design System 规范体系", "B端繁复数据可视化", "AIGC 界面增效设计", "HTML5 / Tailwind CSS 原型"]
    }
  },
  product_designer: {
    name: "产品设计师",
    category: "设计与创意",
    styles: {
      template: 'minimalist',
      primaryColor: '#1e293b', // Slate 800 - extreme minimalism
      textColor: '#1f2937',
      fontSize: 'sm',
      fontFamily: 'sans',
      spacing: 'compact',
      layout: 'one-column',
      showAvatar: false,
    },
    data: {
      personalInfo: {
        name: "沈易凡",
        title: "全栈产品设计师",
        email: "shen_yifan@example.com",
        phone: "139-2222-3333",
        location: "北京·朝阳",
        website: "behance.net/yifan_design",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150"
      },
      summary: "跨越界面设计与前端工程的全栈设计师。擅长用产品经理的逻辑思考需求，用极简的艺术手法设计方案，用优雅的交互代码确保高保真还原，注重以数据与商业价值双维驱动体验迭代。",
      experiences: [
        {
          id: "exp1",
          company: "微光极速网络",
          position: "高级产品设计师",
          startDate: "2022-11",
          endDate: "至今",
          description: "• 主导“闪阅”阅读器移动端全链路体验优化。制定从用户行为流到视觉界面的多套 A/B 方案。\n• 将首轮内容付费决策流从 5 步精简为 2 步，使得季度客单价提升 18%，日活互动频度增长 25%。"
        },
        {
          id: "exp2",
          company: "像素极客工作室",
          position: "全栈设计师",
          startDate: "2020-07",
          endDate: "2022-10",
          description: "• 负责多款新锐消费品牌 SaaS 控制台与移动站的设计、重构与基础 JS 原型开发。\n• 参与重塑官网微动效与品牌表达，建立轻量美观的动态展示组件，荣获多项垂直创意设计奖提名。"
        }
      ],
      educations: [
        {
          id: "edu1",
          school: "同济大学",
          major: "工业设计 (数字媒介方向)",
          degree: "学士",
          startDate: "2016-09",
          endDate: "2020-06",
          description: "系统修读人机工程学、交互心理学。毕业设计获学院年度最佳商业创意奖。"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "零代码卡片排版编辑器",
          role: "产品发起者 & UI/UX 设计",
          startDate: "2023-04",
          endDate: "2023-11",
          description: "一款面向新媒体创作者的排版工具，主打拖拽即生与无损矢量多格式输出。\n• 独创卡片物理边缘磁贴附吸算法与自适应行距排布机制，大幅提升了文字内容产出美观度。\n• 采用简约的暗色系沉浸式界面，把排版核心功能的包装效率提升 25%。"
        }
      ],
      skills: ["全链路 UI/UX", "可用性工程", "Figma 敏捷协作", "精美微动效原型", "前端原生 CSS 动画", "AIGC 界面设计精细化"]
    }
  },
  b_product_manager: {
    name: "B端产品经理",
    category: "研发与产品",
    styles: {
      template: 'modern',
      primaryColor: '#ea580c', // Orange 600 - energetic and bold
      textColor: '#1f2937',
      fontSize: 'sm',
      fontFamily: 'sans',
      spacing: 'normal',
      layout: 'one-column',
      showAvatar: true,
    },
    data: {
      personalInfo: {
        name: "李哲瀚",
        title: "B端高级产品经理",
        email: "zhehan_li@example.com",
        phone: "135-8888-9999",
        location: "深圳·南山",
        website: "pmcaff.com/u/zhehan",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
      },
      summary: "6年B端SaaS产品设计与实施经验。曾负责复杂ERP、CRM及协同办公系统的重塑，擅长理顺复杂业务流程，并将其转化为极致高能的产品界面。深谙数字化转型的底层逻辑，注重客户转化率与系统续签率。",
      experiences: [
        {
          id: "exp1",
          company: "蓝鲸数字化智行科技",
          position: "高级SaaS产品经理",
          startDate: "2021-08",
          endDate: "至今",
          description: "• 负责工业互联ERP系统核心采购与履约模块设计。重塑多审批角色下的复杂协同流程。\n• 砍掉不必要的操作链路 18 个，使得平均履约时效提升 30%，系统客户投诉率下降 45%。"
        },
        {
          id: "exp2",
          company: "领跑者云科技",
          position: "产品经理",
          startDate: "2019-03",
          endDate: "2021-07",
          description: "• 主导客服中心工单协同系统的冷启动与MVP规划。梳理底层数据关联，制定 12 种核心状态模型。\n• 实现跨端工单自动路由分发，帮助各政企客户提升工单日度完结率 22%。"
        }
      ],
      educations: [
        {
          id: "edu1",
          school: "华中科技大学",
          major: "信息管理与信息系统",
          degree: "学士",
          startDate: "2015-09",
          endDate: "2019-06",
          description: "系统学习数据结构、业务系统架构分析，荣获省校级创青春商业建模挑战赛一等奖。"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "蓝鲸大宗采购自适应撮合引擎",
          role: "产品发起者与核心设计",
          startDate: "2022-03",
          endDate: "2022-11",
          description: "一站式智能供应商撮合与定价决策平台，缩短中间询价沟通阻力。\n• 引入多维度比价算法模型和自动化推荐框架，将询价单流转周期由平均 3 天降至 4 小时。"
        }
      ],
      skills: ["复杂业务流程梳理", "UML/PRD 极致严谨编写", "Axure/Figma 高保真原型", "SaaS 核心定价模型设计", "数据治理与建模", "跨部门敏捷开发统筹"]
    }
  },
  visual_designer: {
    name: "视觉设计师",
    category: "设计与创意",
    styles: {
      template: 'creative',
      primaryColor: '#ea580c', // Bright Orange
      textColor: '#0f172a',
      fontSize: 'base',
      fontFamily: 'sans',
      spacing: 'normal',
      layout: 'two-column-right',
      showAvatar: true,
    },
    data: {
      personalInfo: {
        name: "刘艺凡",
        title: "视觉/品牌设计师",
        email: "yifan_design@example.com",
        phone: "159-8888-7777",
        location: "杭州·西湖",
        website: "behance.net/yifan_liu",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
      },
      summary: "4年新锐创意视觉及品牌艺术设计经验，擅长潮流主视觉设定、品牌VI升级、IP衍生开发和商业摄影美术指导。通过前沿的3D视觉与平面设计的完美结合，为品牌注入独特的视觉资产与情感共鸣。",
      experiences: [
        {
          id: "exp1",
          company: "次元新势创意社",
          position: "资深视觉设计师",
          startDate: "2022-09",
          endDate: "至今",
          description: "• 主导 6 个千万级国潮消费品牌的整体包装升级与年度视觉战役方案，主导衍生IP设定。\n• 为天猫/京东大促设计全链路高规格互动主视觉，主站点击率提升 22%，商品动销提升 18%。"
        },
        {
          id: "exp2",
          company: "星点创意工坊",
          position: "平面设计师",
          startDate: "2020-07",
          endDate: "2022-08",
          description: "• 负责知名咖啡品牌全套线下视觉、礼盒包装与门店周边物料的像素级设计和落地把控。\n• 兼顾线上社媒推广海报设计，风格时尚活泼，累计产生 10W+ 社群裂变与曝光量。"
        }
      ],
      educations: [
        {
          id: "edu1",
          school: "中国美术学院",
          major: "视觉传达设计 (品牌策划方向)",
          degree: "学士",
          startDate: "2016-09",
          endDate: "2020-06",
          description: "专业成绩前 5%，多次获得校级一等奖学金，毕设荣获学院优秀收藏奖。"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "“茶里时光”国潮品牌全案重塑",
          role: "视觉总监与核心主笔",
          startDate: "2023-01",
          endDate: "2023-07",
          description: "针对品牌形象老化、无法吸引年轻消费者的问题，主导国潮现代插画VI设计及包装更新。\n• 设计全新IP角色与 4 款极具东方韵味的限定礼盒，助力上市首周销量破千万。"
        }
      ],
      skills: ["品牌视觉定位(VI)", "C4D/Blender 3D渲染", "包装/插画设计", "Adobe CC 核心套件", "商业美术指导", "潮流趋势洞察与商业转化"]
    }
  },
  frontend_dev: {
    name: "前端开发",
    category: "研发与产品",
    styles: {
      template: 'modern',
      primaryColor: '#2563eb', // Blue 600
      textColor: '#1f2937',
      fontSize: 'sm',
      fontFamily: 'mono', // Monospace touches for developers
      spacing: 'compact',
      layout: 'two-column-right',
      showAvatar: true,
    },
    data: {
      personalInfo: {
        name: "张极客",
        title: "资深前端开发工程师",
        email: "zhangjike@example.com",
        phone: "138-0000-1111",
        location: "北京·海淀",
        website: "github.com/geekzhang",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
      },
      summary: "拥有 5 年前端核心开发经验，主导过多个中大型 SaaS 系统的架构设计与全栈开发。精通 React 生态系统，擅长复杂交互与极致性能优化。对前端工程化、监控体系有深入理解，具有优秀的团队协作和技术攻坚能力。",
      experiences: [
        {
          id: "exp1",
          company: "北京科创星空科技",
          position: "前端架构组组长 / 资深开发",
          startDate: "2023-03",
          endDate: "至今",
          description: "• 负责公司核心可视化看板系统性能重构。基于 React 18 + Vite 升级，页面首屏加载时间缩短 50%。\n• 搭建高可用性的前端监控平台（Sentry），实现秒级线上异常定位和分析，保障微前端应用稳健运行。"
        },
        {
          id: "exp2",
          company: "微盟智云信息技术",
          position: "高级前端工程师",
          startDate: "2021-07",
          endDate: "2023-02",
          description: "• 担任核心电商 SaaS 系统结算模块负责人。处理高并发核心交易链路，保持高频率平稳迭代交付。\n• 封装多套符合无障碍规范的基础和业务组件发布至公司私有 npm，跨部门复用率达 80%。"
        }
      ],
      educations: [
        {
          id: "edu1",
          school: "北京邮电大学",
          major: "软件工程",
          degree: "学士",
          startDate: "2017-09",
          endDate: "2021-06",
          description: "成绩前 10%，曾获 ACM 校赛一等奖、多次专业奖学金。"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "SaaS 可视化搭建引擎",
          role: "技术负责人 & 核心开发",
          startDate: "2023-05",
          endDate: "2024-01",
          description: "面向企业交付的零代码高效率建站平台。采用拖拽编辑、组件动态加载、热状态驱动。\n• 完美融合 HTML5 DnD 规范与 Canvas 技术开发高性能画布，极致支持嵌套容器与无极缩放。\n• 研发版本库秒级热更新机制与多层状态缓存回滚，保证大型团队在线协作无冲突。"
        }
      ],
      skills: ["React / Next.js", "TypeScript / TSX", "Node.js (NestJS)", "Vite / Esbuild / Rollup", "Tailwind CSS", "高性能组件封装", "微前端架构 (qiankun)", "CI/CD & Shell Scripting"]
    }
  },
  backend_architect: {
    name: "后端架构师",
    category: "研发与产品",
    styles: {
      template: 'modern',
      primaryColor: '#1e3a8a', // Deep navy blue
      textColor: '#1f2937',
      fontSize: 'sm',
      fontFamily: 'mono',
      spacing: 'compact',
      layout: 'one-column',
      showAvatar: false,
    },
    data: {
      personalInfo: {
        name: "周承林",
        title: "资深后端/高并发架构师",
        email: "chenglin.zhou@example.com",
        phone: "131-9999-8888",
        location: "深圳·腾讯云区",
        website: "blog.csdn.net/zhou_arch",
        avatar: ""
      },
      summary: "8年后端开发及微服务架构设计经验，精通 Go & Java 语言，专注于大规模分布式系统的高吞吐量、低时延治理。拥有扎实的底层算法、数据一致性协议及大型中间件运维落地功底。",
      experiences: [
        {
          id: "exp1",
          company: "聚美云创科技有限公司",
          position: "资深后端架构师",
          startDate: "2022-03",
          endDate: "至今",
          description: "• 主导电商核心交易模块向 Go 语言重构。构建异地多活的高容灾底座，承载 QPS 峰值 80,000+。\n• 引入多级分布式缓存机制，大幅降低数据库 IO 负载，将核心下单链路耗时缩短至 42ms。"
        },
        {
          id: "exp2",
          company: "泰丰金融服务公司",
          position: "高级Java工程师 / 研发负责人",
          startDate: "2018-07",
          endDate: "2022-02",
          description: "• 负责高频风控计算系统的架构搭建，基于 Spring Boot 3 + Flink 实时算子处理海量支付流水数据。\n• 重构死锁核心计算逻辑，将全网欺诈交易误拦截率从 2.4% 优化至 0.35%。"
        }
      ],
      educations: [
        {
          id: "edu1",
          school: "浙江大学",
          major: "计算机科学与技术",
          degree: "硕士",
          startDate: "2015-09",
          endDate: "2018-06",
          description: "研究方向为分布式文件系统与虚拟化容错。发表多篇SCI/核心学术会议成果。"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "分布式多路缓存同步一致平台",
          role: "首席架构师与主程",
          startDate: "2022-10",
          endDate: "2023-04",
          description: "面向大型零售体系的跨地域实时状态与价格同步引擎。\n• 采用 Raft 变体共识框架，实现在边缘节点弱网络环境下的强一致性共识算法，保证多业务端无价格冲突。"
        }
      ],
      skills: ["Golang / Java (Spring)", "分布式微服务架构 (K8s)", "Redis 多级缓存与治理", "Apache Flink 实时流计算", "MySQL 高并发调优", "Raft 强一致共识协议"]
    }
  },
  ops_manager: {
    name: "运营管理",
    category: "运营与销售",
    styles: {
      template: 'editorial',
      primaryColor: '#c2410c', // Dark Orange
      textColor: '#1f2937',
      fontSize: 'sm',
      fontFamily: 'serif', // Beautiful elegant serifs
      spacing: 'relaxed',
      layout: 'two-column-left',
      showAvatar: true,
    },
    data: {
      personalInfo: {
        name: "陈晴枫",
        title: "资深产品运营经理",
        email: "chenqingfeng@example.com",
        phone: "139-1111-2222",
        location: "上海·浦东",
        website: "linkedin.com/in/qingfeng",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
      },
      summary: "6 年中大型互联网产品运营管理经验。敏锐的用户洞察，数据驱动导向，精通用户画像分析、活跃度拉升与流失链路优化。擅长与产品、技术和创意设计师高效协同，多渠道促成优质社区生态的变现与生命周期价值最大化。",
      experiences: [
        {
          id: "exp1",
          company: "上海极速跃动科技",
          position: "高级产品运营经理",
          startDate: "2022-10",
          endDate: "至今",
          description: "• 负责社交App“圈子”的玩法和用户增长。带领 5 人运营增长团队，联合产品重塑新版互动链路。\n• 推出圈子声望体系与动态话题活动，促使日活互动频次跃升 120%，新用户次日留存提升 12%。"
        },
        {
          id: "exp2",
          company: "悦行信息系统",
          position: "B端商家运营主管",
          startDate: "2020-03",
          endDate: "2022-09",
          description: "• 规划全国品牌商户全景培训及结算支持，实现 30,000+ 在线商户平滑冷启动，降低客诉率 40%。\n• 采用自动货架匹配和精准品类推送，促成季末商家周转期减少 4.5 天，交易转化率提升 18%。"
        }
      ],
      educations: [
        {
          id: "edu1",
          school: "复旦大学",
          major: "工商管理",
          degree: "学士",
          startDate: "2016-09",
          endDate: "2020-06",
          description: "优秀毕业生，多次获学业一等奖学金，擅长定量分析与宏观商业运营规划。"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "“圈子”社交增长攻坚战",
          role: "产品运营总负责人",
          startDate: "2023-04",
          endDate: "2023-09",
          description: "针对留存低迷、用户黏性不足，重新定位兴趣圈层，进行社群生态治理重构。\n• 引入头部创作者引流计划，半年内培养出 5 个百万级活跃专区，大幅优化用户生命周期价值 (LTV)。"
        }
      ],
      skills: ["精细化用户画像", "数据挖掘 / Tableau / SQL", "精细化 A/B 测试", "社群转化与私域运营", "KOL 培育与冷启动", "多方跨部门敏捷协同"]
    }
  },
  financial_analyst: {
    name: "金融分析师",
    category: "金融与咨询",
    styles: {
      template: 'classic',
      primaryColor: '#1d4ed8', // Royal Blue
      textColor: '#0f172a',
      fontSize: 'sm',
      fontFamily: 'serif',
      spacing: 'normal',
      layout: 'one-column',
      showAvatar: true,
    },
    data: {
      personalInfo: {
        name: "高远",
        title: "高级投资及财务分析师 (CFA)",
        email: "gaoyuan_cfa@example.com",
        phone: "136-1234-5678",
        location: "北京·金融街",
        website: "cfa-china.org/member/yuan",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
      },
      summary: "持有特许金融分析师 (CFA) 与中国注册会计师 (CPA) 证书。5年顶级券商及投行财务顾问经验，擅长行业宏观趋势研判、严谨估值模型构建、精准尽职调查及投融资决策协助。",
      experiences: [
        {
          id: "exp1",
          company: "盛京国际证券股份有限公司",
          position: "高级宏观/行业研究员",
          startDate: "2022-01",
          endDate: "至今",
          description: "• 负责科技制造及新能源版块深度估值研究，搭建 20+ 个精密上市公司多情景估值折现模型。\n• 撰写 150 篇重磅研报与深度跟踪评级，多篇报告入选路孚特(Refinitiv)行业黄金评级。"
        },
        {
          id: "exp2",
          company: "君安融通投资管理顾问",
          position: "投资银行部财务顾问",
          startDate: "2019-07",
          endDate: "2021-12",
          description: "• 深度参与 4 宗高新技术产业跨境收购案财务顾问全过程，主导买方全面财务合规尽调。\n• 优化测算对价对母公司未来 EPS 的稀释效应，成功节省前期交易重组成本 12%。"
        }
      ],
      educations: [
        {
          id: "edu1",
          school: "清华大学五道口金融学院",
          major: "金融学",
          degree: "硕士",
          startDate: "2017-09",
          endDate: "2019-06",
          description: "全额奖学金，校研会副主席。完成多篇宏观货币政策对区域资产定价冲击的重点专栏课题。"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "超大型碳中和新能源产业投资基金可行性论证",
          role: "估值分析组主笔",
          startDate: "2022-09",
          endDate: "2022-12",
          description: "拟规模百亿元产业基金设立前的商业可行性论证与底层项目模拟收益评估。\n• 通过复杂的双概率蒙特卡洛敏感度算法模拟未来 10 年现金流，提供关键风控测算及底盘溢价标准。"
        }
      ],
      skills: ["DCF/乘数估值模型", "宏观/行业行研撰写", "跨国并购(M&A)财务尽调", "CFA三级通过 / CPA核心考过", "Bloomberg / Wind 操作", "投融资条款谈判支持"]
    }
  },
  academic_researcher: {
    name: "学术科研",
    category: "教育与学术",
    styles: {
      template: 'editorial',
      primaryColor: '#0f172a', // Academic charcoal black
      textColor: '#1e293b',
      fontSize: 'sm',
      fontFamily: 'serif',
      spacing: 'relaxed',
      layout: 'one-column',
      showAvatar: false,
    },
    data: {
      personalInfo: {
        name: "韩晓博士",
        title: "人工智能/模式识别助理研究员",
        email: "x_han@academic-lab.org",
        phone: "186-2122-3456",
        location: "南京·鼓楼",
        website: "scholar.google.com/citations?han_ai",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
      },
      summary: "博士毕业于南京大学计算机科学与技术学院，聚焦于机器学习、神经网络表示学习及医学图像自监督识别研究。累计在CVPR、NeurIPS等顶级学术会议上发表第一作者或通讯作者论文5篇，主持多项青年科学基金及重大联合科学攻关课题。",
      experiences: [
        {
          id: "exp1",
          company: "先进计算国家重点实验室",
          position: "助理研究员 / 博士后",
          startDate: "2023-07",
          endDate: "至今",
          description: "• 主持国家自然科学基金青年基金“基于解耦表征的三维医学CT鲁棒分割算法”。\n• 与三甲医院合作落地临床前列腺AI辅助检测大模型，将多源造影微小癌变灶召回率由 82% 提升至 94%。"
        }
      ],
      educations: [
        {
          id: "edu1",
          school: "南京大学",
          major: "计算机应用技术",
          degree: "工学博士",
          startDate: "2018-09",
          endDate: "2023-06",
          description: "导师为模式识别领域知名长江学者。荣获南京大学学术创新奖学金、CCF优秀博士学位论文提名。"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "大规模少样本自监督视觉表征泛化研究",
          role: "课题组副组长兼主线设计",
          startDate: "2021-03",
          endDate: "2023-02",
          description: "针对医疗胶片样本匮乏、标注极高昂的现实痛点，构建轻量级无监督对比预训练底盘。\n• 提出的解耦自适应注意机制，成功减少训练对标注样本依赖 80%，并在CVPR会议发表大会长口头汇报论文。"
        }
      ],
      skills: ["PyTorch / JAX", "自监督/对比表示学习", "多模态医学CT影像算法", "中英文高水平学术写作", "国自然青年/重大科学基金撰写", "高性能集群运算 (SLURM)"]
    }
  },
  hr_specialist: {
    name: "HRBP主管",
    category: "通用与管理",
    styles: {
      template: 'modern',
      primaryColor: '#0284c7', // Sky Blue
      textColor: '#1f2937',
      fontSize: 'sm',
      fontFamily: 'sans',
      spacing: 'normal',
      layout: 'two-column-left',
      showAvatar: true,
    },
    data: {
      personalInfo: {
        name: "常乐",
        title: "资深人力资源业务合作伙伴 (HRBP)",
        email: "changle_hr@example.com",
        phone: "137-5555-6666",
        location: "成都·高新",
        website: "linkedin.com/in/changle-hr",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
      },
      summary: "5年互联网及硬科技独角兽企业人力资源全盘管理经验。深谙HRBP定位，擅长将组织架构及人才梯队匹配至战略发展。熟稔高端研发/产品线技术招聘，精通组织绩效重构、胜任力模型搭建和企业文化落地。",
      experiences: [
        {
          id: "exp1",
          company: "智享出行科技集团",
          position: "资深HRBP (自动驾驶事业部)",
          startDate: "2022-04",
          endDate: "至今",
          description: "• 深度对接 150 人顶尖自动驾驶核心算法团队。一年内精准猎聘并落地 35 位业内领军海归专家。\n• 重构技术研产考核OKR与双轨级薪酬激励体系，将核心算法人员非正常离职率控制在 2% 以下。"
        },
        {
          id: "exp2",
          company: "云极智能机器人",
          position: "人力资源综合主管 / 招聘负责人",
          startDate: "2020-03",
          endDate: "2022-03",
          description: "• 负责公司从 40 人向 250 人高速扩张期的招聘。优化整套校园招聘与定向猎聘渠道，单月交付人效提升 60%。\n• 建立并推行涵盖 5 大技术维度的研发人才胜任力评估模型，为期末调薪与晋升评级提供坚实数据标准。"
        }
      ],
      educations: [
        {
          id: "edu1",
          school: "四川大学",
          major: "人力资源管理",
          degree: "学士",
          startDate: "2016-09",
          endDate: "2020-06",
          description: "主修劳动经济学、绩效管理。荣获全省企业模拟经营对抗大赛一等奖。"
        }
      ],
      projects: [
        {
          id: "proj1",
          name: "事业部“星核计划”核心骨干继任者工程",
          role: "组织发展(OD)策略主导者",
          startDate: "2023-01",
          endDate: "2023-08",
          description: "为应对管理层梯队断档和高潜人员培养无序制定的中高阶管理层储备项目。\n• 识别并提拔 18 名核心骨干，提供针对性的领导力培训，显著提升关键岗位备份率 100%。"
        }
      ],
      skills: ["人才地图(Talent Mapping)", "高端技术研发猎头招聘", "OKR绩效指标库建立", "高阶OD/继任者工程规划", "劳动用工争议合规化", "高能跨部门冲突调停"]
    }
  }
};

export const INITIAL_RESUME_DATA = INDUSTRY_TEMPLATES.ui_designer.data;
export const INITIAL_RESUME_STYLES = INDUSTRY_TEMPLATES.ui_designer.styles;
export const PRESET_COLORS = [
  { hex: '#2563eb', label: '曜石蓝' },
  { hex: '#ea580c', label: '极客橙' },
  { hex: '#0284c7', label: '天穹蓝' },
  { hex: '#1e3a8a', label: '深海蓝' },
  { hex: '#c2410c', label: '温暖橘' },
  { hex: '#1e293b', label: '极简灰' },
];
