import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Sparkles,
  Download,
  Settings,
  Grid,
  Type,
  Layout,
  Maximize2,
  Minimize2,
  RefreshCw,
  FileCode,
  CheckCircle,
  TrendingUp,
  BrainCircuit,
  Camera,
  Check,
  Eye,
  Sliders,
  Sparkle,
  Trash2,
  Save,
  CheckCheck,
  Search,
  Printer,
  Pencil
} from "lucide-react";
import { ResumeData, ResumeStyles, TemplateType } from "./types";
import {
  INDUSTRY_TEMPLATES,
  PRESET_COLORS,
  INITIAL_RESUME_DATA,
  INITIAL_RESUME_STYLES
} from "./data";

import ResumeForm from "./components/ResumeForm";
import ResumePreview, { ResumePreviewRef } from "./components/ResumePreview";
import JDOptimizer from "./components/JDOptimizer";
import AIDocumentPhoto from "./components/AIDocumentPhoto";
import { Select } from "./components/ui/Select";

export interface SavedResume {
  id: string;
  name: string;
  selectedIndustry: string;
  data: ResumeData;
  styles: ResumeStyles;
  updatedAt: string;
}

export default function App() {
  const isPrintRoute = typeof window !== "undefined" && (window.location.pathname === "/print" || window.location.pathname.startsWith("/resume-print"));
  
  const [printData, setPrintData] = useState<{ data: ResumeData; styles: ResumeStyles } | null>(() => {
    if (!isPrintRoute) return null;
    const stored = localStorage.getItem("printResumeData");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse printResumeData:", e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (!isPrintRoute) return;
    
    const handleDataReady = () => {
      const stored = localStorage.getItem("printResumeData");
      if (stored) {
        try {
          setPrintData(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse printResumeData on event:", e);
        }
      }
    };

    window.addEventListener("resume-data-ready", handleDataReady);
    window.addEventListener("storage", handleDataReady);
    handleDataReady();

    return () => {
      window.removeEventListener("resume-data-ready", handleDataReady);
      window.removeEventListener("storage", handleDataReady);
    };
  }, [isPrintRoute]);

  // Status message states
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("");

  const showStatus = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Load all resume drafts (with legacy single draft migration)
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>(() => {
    const savedList = localStorage.getItem("ai_saved_resumes_v1");
    if (savedList) {
      try {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }

    // Try migrating legacy single draft
    const legacyData = localStorage.getItem("ai_resume_draft_data");
    const legacyStyles = localStorage.getItem("ai_resume_draft_styles");
    const legacyIndustry = localStorage.getItem("ai_resume_selected_industry") || "ui_designer";

    let initialData = INDUSTRY_TEMPLATES.ui_designer.data;
    if (legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        if (parsed && parsed.personalInfo && parsed.experiences) {
          initialData = parsed;
        }
      } catch (e) {}
    }

    let initialStyles = INDUSTRY_TEMPLATES.ui_designer.styles;
    if (legacyStyles) {
      try {
        const parsed = JSON.parse(legacyStyles);
        if (parsed && parsed.template && parsed.primaryColor) {
          initialStyles = parsed;
        }
      } catch (e) {}
    }

    return [
      {
        id: "default-draft",
        name: INDUSTRY_TEMPLATES[legacyIndustry]?.name || "UI设计师",
        selectedIndustry: legacyIndustry,
        data: initialData,
        styles: initialStyles,
        updatedAt: new Date().toISOString()
      }
    ];
  });

  const [activeResumeId, setActiveResumeId] = useState<string>(() => {
    return localStorage.getItem("ai_active_resume_id_v1") || "default-draft";
  });

  // Find the currently active resume in the saved list
  const activeResume = savedResumes.find(r => r.id === activeResumeId) || savedResumes[0];

  // Active workspace states (populated from current active resume draft)
  const [resumeData, setResumeData] = useState<ResumeData>(activeResume.data);
  const [resumeStyles, setResumeStyles] = useState<ResumeStyles>(activeResume.styles);
  const [selectedIndustry, setSelectedIndustry] = useState<string>(activeResume.selectedIndustry);

  // Active Field for Editor to Preview live interaction
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const resumePreviewRef = useRef<ResumePreviewRef>(null);

  // Tab State for left editor panel: 'edit' | 'style' | 'optimize' | 'photo'
  const [activeEditorTab, setActiveEditorTab] = useState<'edit' | 'style' | 'optimize' | 'photo'>('edit');

  // Preview full-screen state
  const [isPreviewExpanded, setIsPreviewExpanded] = useState<boolean>(false);

  // Pagination page count state
  const [pageCount, setPageCount] = useState<number>(1);

  // Responsive workspace tab switcher (editor vs preview) for mobile/tablet screens
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Search query for jobs/templates
  const [searchQuery, setSearchQuery] = useState("");

  // Filter templates based on query
  const filteredTemplates = Object.entries(INDUSTRY_TEMPLATES).filter(([_, item]) => {
    const q = searchQuery.trim().toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.data.personalInfo.title.toLowerCase().includes(q) ||
      item.data.skills.some(s => s.toLowerCase().includes(q))
    );
  });

  // Highlighted common presets for default viewing
  const recommendedPresets = [
    ["ui_designer", INDUSTRY_TEMPLATES.ui_designer],
    ["b_product_manager", INDUSTRY_TEMPLATES.b_product_manager],
    ["frontend_dev", INDUSTRY_TEMPLATES.frontend_dev],
    ["ops_manager", INDUSTRY_TEMPLATES.ops_manager],
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for beautiful in-app custom modal overlay to prevent sandboxed window.confirm failures
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'template_load' | 'reset_confirm' | 'delete_confirm' | 'create_new' | 'iframe_print_warning';
    title: string;
    description: string;
    meta?: any;
  }>({
    isOpen: false,
    type: 'template_load',
    title: '',
    description: ''
  });

  // Inline rename states for drafts bar
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [editingNameVal, setEditingNameVal] = useState<string>("");

  // Create new manually
  const [newManualName, setNewManualName] = useState("");
  const [newManualIndustry, setNewManualIndustry] = useState("ui_designer");

  // Keep activeResumeId stored
  useEffect(() => {
    localStorage.setItem("ai_active_resume_id_v1", activeResumeId);
  }, [activeResumeId]);

  // Real-time synchronization of current edits back to drafts list with small debounce to prevent render loops
  useEffect(() => {
    const timer = setTimeout(() => {
      setSavedResumes(prev => {
        const index = prev.findIndex(r => r.id === activeResumeId);
        if (index !== -1) {
          const current = prev[index];
          if (
            JSON.stringify(current.data) !== JSON.stringify(resumeData) ||
            JSON.stringify(current.styles) !== JSON.stringify(resumeStyles) ||
            current.selectedIndustry !== selectedIndustry
          ) {
            const updated = [...prev];
            updated[index] = {
              ...current,
              data: resumeData,
              styles: resumeStyles,
              selectedIndustry,
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem("ai_saved_resumes_v1", JSON.stringify(updated));
            return updated;
          }
        }
        return prev;
      });
    }, 150);

    // Sync legacy keys too for robust compatibility
    localStorage.setItem("ai_resume_draft_data", JSON.stringify(resumeData));
    localStorage.setItem("ai_resume_draft_styles", JSON.stringify(resumeStyles));
    localStorage.setItem("ai_resume_selected_industry", selectedIndustry);

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setLastSavedTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);

    return () => clearTimeout(timer);
  }, [resumeData, resumeStyles, selectedIndustry, activeResumeId]);

  // Draft switches
  const handleSwitchResume = (id: string) => {
    const target = savedResumes.find(r => r.id === id);
    if (target) {
      setActiveResumeId(id);
      setResumeData(target.data);
      setResumeStyles(target.styles);
      setSelectedIndustry(target.selectedIndustry);
      showStatus(`已切换至简历副本: ${target.name}`, 'success');
    }
  };

  // Inline rename actions
  const handleStartRename = (id: string, currentName: string) => {
    setEditingResumeId(id);
    setEditingNameVal(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (editingNameVal.trim()) {
      setSavedResumes(prev => {
        const updated = prev.map(r => r.id === id ? { ...r, name: editingNameVal.trim() } : r);
        localStorage.setItem("ai_saved_resumes_v1", JSON.stringify(updated));
        return updated;
      });
      showStatus("已成功重命名该简历副本", 'success');
    }
    setEditingResumeId(null);
  };

  // Clicking template triggers custom choice Modal instead of blocked standard confirm
  const handleTemplateClick = (key: string) => {
    const template = INDUSTRY_TEMPLATES[key];
    if (template) {
      setModalConfig({
        isOpen: true,
        type: 'template_load',
        title: "💡 载入基准岗位模板",
        description: `您选择了【${template.name}】岗位的基准配置，我们将为您加载专为此岗位打造的最佳简历结构与核心关键词排版。请选择处理方式：`,
        meta: { templateKey: key }
      });
    }
  };

  // Choice A: Create new separate resume from template
  const handleCreateFromTemplateNew = (key: string) => {
    const template = INDUSTRY_TEMPLATES[key];
    if (!template) return;
    const newId = `resume-${Date.now()}`;
    const newName = `投递：${template.name}`;
    const newResume: SavedResume = {
      id: newId,
      name: newName,
      selectedIndustry: key,
      data: template.data,
      styles: template.styles,
      updatedAt: new Date().toISOString()
    };

    setSavedResumes(prev => {
      const updated = [...prev, newResume];
      localStorage.setItem("ai_saved_resumes_v1", JSON.stringify(updated));
      return updated;
    });

    setActiveResumeId(newId);
    setResumeData(template.data);
    setResumeStyles(template.styles);
    setSelectedIndustry(key);

    setModalConfig(prev => ({ ...prev, isOpen: false }));
    showStatus(`已为您成功新建并载入独立简历副本：${newName}`, 'success');
  };

  // Choice B: Overwrite active resume draft with template
  const handleOverwriteFromTemplate = (key: string) => {
    const template = INDUSTRY_TEMPLATES[key];
    if (!template) return;

    setSelectedIndustry(key);
    setResumeData(template.data);
    setResumeStyles(template.styles);

    setSavedResumes(prev => {
      const updated = prev.map(r => r.id === activeResumeId ? {
        ...r,
        name: `投递：${template.name}`,
        selectedIndustry: key,
        data: template.data,
        styles: template.styles,
        updatedAt: new Date().toISOString()
      } : r);
      localStorage.setItem("ai_saved_resumes_v1", JSON.stringify(updated));
      return updated;
    });

    setModalConfig(prev => ({ ...prev, isOpen: false }));
    showStatus(`已成功覆盖并载入【${template.name}】基准内容`, 'success');
  };

  // Manual Reset / Clear active draft
  const handleResetDraft = () => {
    const name = activeResume ? activeResume.name : "当前简历";
    setModalConfig({
      isOpen: true,
      type: 'reset_confirm',
      title: "⚠️ 确认重置当前内容吗？",
      description: `这将会清除您的简历副本“${name}”中进行的所有自定义修改，并将内容彻底还原至该岗位的行业标准数据。此操作无法撤销。`,
    });
  };

  const performResetDraft = () => {
    const template = INDUSTRY_TEMPLATES[selectedIndustry] || INDUSTRY_TEMPLATES.ui_designer;
    setResumeData(template.data);
    setResumeStyles(template.styles);
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    showStatus("当前简历内容已成功重置为初始基准", 'info');
  };

  // Delete Resume Draft
  const handleDeleteResume = (id: string) => {
    if (savedResumes.length <= 1) {
      showStatus("至少需要保留一个简历版本哦", 'error');
      return;
    }
    const target = savedResumes.find(r => r.id === id);
    if (target) {
      setModalConfig({
        isOpen: true,
        type: 'delete_confirm',
        title: "🗑️ 确认删除该简历版本？",
        description: `您正在永久删除简历版本“${target.name}”。一旦删除，该版本下的所有自定义内容和排版样式将被永久抹去，且无法撤销。`,
        meta: { resumeId: id }
      });
    }
  };

  const performDeleteResume = (id: string) => {
    const updated = savedResumes.filter(r => r.id !== id);
    setSavedResumes(updated);
    localStorage.setItem("ai_saved_resumes_v1", JSON.stringify(updated));

    if (activeResumeId === id) {
      const nextActive = updated[0];
      setActiveResumeId(nextActive.id);
      setResumeData(nextActive.data);
      setResumeStyles(nextActive.styles);
      setSelectedIndustry(nextActive.selectedIndustry);
    }

    setModalConfig(prev => ({ ...prev, isOpen: false }));
    showStatus("简历版本已彻底删除", 'success');
  };

  // Create new manually
  const handleCreateNewResumePrompt = () => {
    setNewManualName("");
    setNewManualIndustry("ui_designer");
    setModalConfig({
      isOpen: true,
      type: 'create_new',
      title: "📂 新建简历版本",
      description: "您可以基于现有的某个岗位模板为起点，创建一个全新的、完全独立的简历版本，用于投递不同的公司和职位。"
    });
  };

  const performCreateNewResume = () => {
    const template = INDUSTRY_TEMPLATES[newManualIndustry] || INDUSTRY_TEMPLATES.ui_designer;
    const newId = `resume-${Date.now()}`;
    const name = newManualName.trim() || template.name;
    const newResume: SavedResume = {
      id: newId,
      name: name,
      selectedIndustry: newManualIndustry,
      data: template.data,
      styles: template.styles,
      updatedAt: new Date().toISOString()
    };

    setSavedResumes(prev => {
      const updated = [...prev, newResume];
      localStorage.setItem("ai_saved_resumes_v1", JSON.stringify(updated));
      return updated;
    });

    setActiveResumeId(newId);
    setResumeData(template.data);
    setResumeStyles(template.styles);
    setSelectedIndustry(newManualIndustry);

    setModalConfig(prev => ({ ...prev, isOpen: false }));
    showStatus(`新建简历版本“${name}”成功！已自动切换为当前编辑篇。`, 'success');
  };

  // Style change helper
  const updateStyles = (updates: Partial<ResumeStyles>) => {
    setResumeStyles((prev) => ({ ...prev, ...updates }));
  };

  // Live import of resume JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.personalInfo && parsed.experiences && parsed.educations) {
            setResumeData(parsed);
            showStatus("简历数据导入成功！", 'success');
          } else {
            throw new Error("格式不完整，缺少必要属性。");
          }
        } catch (err: any) {
          showStatus(`导入失败: ${err.message || "解析JSON失败"}`, 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `resume_${resumeData.personalInfo.name || "export"}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showStatus("已导出 JSON 备份文件", 'success');
    } catch (err) {
      showStatus("导出失败", 'error');
    }
  };

  const handlePrintResume = async () => {
    setIsExporting(true);
    showStatus("正在拉起打印面板...", 'info');

    try {
      // 1. Enter print mode (wait for React state updates if any)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 2. Wait for fonts to be ready to prevent fallback/to-be-loaded font glitches
      await document.fonts.ready;

      // 3. Trigger native print
      window.focus();
      window.print();

      showStatus("打印面板已拉起！如需保存为 PDF，请在目标打印机中选择“另存为 PDF”。", 'success');
    } catch (err: any) {
      console.error(err);
      showStatus(`启动打印失败: ${err.message || "未知错误"}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    showStatus("正在请求服务端生成 PDF 并打包下载...", 'info');
    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: resumeData,
          styles: resumeStyles
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "PDF 导出服务响应失败，请确保服务配置正确。");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeData.personalInfo.name || "resume"}_简历.pdf`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
      showStatus("PDF 简历生成成功，已开始自动下载！", 'success');
    } catch (err: any) {
      console.error(err);
      showStatus(`生成 PDF 失败: ${err.message || "未知错误"}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = () => {
    try {
      showStatus("正在生成并下载 Word 格式简历...", 'info');
      const { personalInfo, experiences, educations, projects, skills, summary } = resumeData;
      
      // Build an incredibly polished, tables-and-borders styled HTML layout for perfect MS Word / WPS formatting
      let docHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:w="urn:schemas-microsoft-com:office:word" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${personalInfo.name || "简历"}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 21cm 29.7cm;
              margin: 2cm 2cm 2cm 2cm;
            }
            body {
              font-family: 'Microsoft YaHei', 'SimHei', 'Calibri', 'Arial', sans-serif;
              font-size: 10.5pt;
              line-height: 1.6;
              color: #2d3748;
            }
            h1 {
              font-size: 22pt;
              font-weight: bold;
              color: #111827;
              margin: 0 0 5px 0;
              text-align: center;
            }
            .subtitle {
              font-size: 12pt;
              color: #4b5563;
              margin: 0 0 10px 0;
              text-align: center;
              font-weight: 500;
            }
            .contact-info {
              font-size: 9.5pt;
              color: #4b5563;
              text-align: center;
              margin-bottom: 25px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 12px;
            }
            .section-header {
              font-size: 13pt;
              font-weight: bold;
              color: #1e3a8a;
              background-color: #f1f5f9;
              padding: 6px 12px;
              margin-top: 22px;
              margin-bottom: 12px;
              border-left: 4px solid #3b82f6;
            }
            .entry-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 6px;
            }
            .entry-table td {
              padding: 4px 0;
            }
            .entry-title {
              font-weight: bold;
              font-size: 11pt;
              color: #1a1a1a;
              text-align: left;
            }
            .entry-meta-role {
              font-weight: bold;
              font-size: 10.5pt;
              color: #4b5563;
              text-align: center;
            }
            .entry-meta-date {
              font-size: 10pt;
              color: #6b7280;
              text-align: right;
            }
            .entry-desc {
              font-size: 10pt;
              color: #374151;
              margin-top: 4px;
              margin-bottom: 15px;
              line-height: 1.5;
              white-space: pre-line;
              text-align: justify;
            }
            .skills-box {
              margin-bottom: 15px;
              line-height: 1.8;
            }
            .skill-item {
              display: inline-block;
              background-color: #f3f4f6;
              color: #1f2937;
              padding: 3px 8px;
              margin-right: 6px;
              margin-bottom: 6px;
              font-size: 9.5pt;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <!-- 个人信息 -->
          <div>
            <h1>${personalInfo.name || "姓名"}</h1>
            <div class="subtitle">${personalInfo.title || ""}</div>
            <div class="contact-info">
              ${[
                personalInfo.phone ? `📞 ${personalInfo.phone}` : null,
                personalInfo.email ? `✉️ ${personalInfo.email}` : null,
                personalInfo.location ? `📍 ${personalInfo.location}` : null,
                personalInfo.website ? `🔗 ${personalInfo.website}` : null
              ].filter(Boolean).join('  |  ')}
            </div>
          </div>

          <!-- 个人总结 -->
          ${summary ? `
            <div class="section-header">个人总结</div>
            <div style="margin-bottom: 20px; text-align: justify; line-height: 1.6; white-space: pre-line;">${summary}</div>
          ` : ''}

          <!-- 工作经历 -->
          ${experiences && experiences.length > 0 ? `
            <div class="section-header">工作经历</div>
            ${experiences.map(exp => `
              <table class="entry-table">
                <tr>
                  <td class="entry-title" style="width: 35%;">${exp.company}</td>
                  <td class="entry-meta-role" style="width: 35%;">${exp.position}</td>
                  <td class="entry-meta-date" style="width: 30%;">${exp.startDate} - ${exp.endDate}</td>
                </tr>
              </table>
              <div class="entry-desc">${exp.description}</div>
            `).join('')}
          ` : ''}

          <!-- 项目经验 -->
          ${projects && projects.length > 0 ? `
            <div class="section-header">项目经验</div>
            ${projects.map(proj => `
              <table class="entry-table">
                <tr>
                  <td class="entry-title" style="width: 35%;">${proj.name}</td>
                  <td class="entry-meta-role" style="width: 35%;">${proj.role}</td>
                  <td class="entry-meta-date" style="width: 30%;">${proj.startDate} - ${proj.endDate}</td>
                </tr>
              </table>
              <div class="entry-desc">${proj.description}</div>
            `).join('')}
          ` : ''}

          <!-- 教育经历 -->
          ${educations && educations.length > 0 ? `
            <div class="section-header">教育经历</div>
            ${educations.map(edu => `
              <table class="entry-table">
                <tr>
                  <td class="entry-title" style="width: 35%;">${edu.school}</td>
                  <td class="entry-meta-role" style="width: 35%;">${edu.major} (${edu.degree})</td>
                  <td class="entry-meta-date" style="width: 30%;">${edu.startDate} - ${edu.endDate}</td>
                </tr>
              </table>
              ${edu.description ? `<div class="entry-desc">${edu.description}</div>` : ''}
            `).join('')}
          ` : ''}

          <!-- 专业技能 -->
          ${skills && skills.length > 0 ? `
            <div class="section-header">专业技能</div>
            <div class="skills-box">
              ${skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
            </div>
          ` : ''}
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume_${personalInfo.name || "download"}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showStatus("Word 格式简历导出成功！可直接在 Word 或 WPS 中进行高级排版和二次编辑。", 'success');
    } catch (err: any) {
      console.error(err);
      showStatus(`Word 导出失败: ${err.message}`, 'error');
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const handleAdoptAISuggestions = (optimizedData: Partial<ResumeData>) => {
    setResumeData((prev) => {
      const updated = { ...prev };
      
      if (optimizedData.personalInfo) {
        updated.personalInfo = {
          ...updated.personalInfo,
          ...optimizedData.personalInfo
        };
      }
      if (optimizedData.summary !== undefined) {
        updated.summary = optimizedData.summary;
      }
      if (optimizedData.experiences) {
        updated.experiences = optimizedData.experiences;
      }
      if (optimizedData.projects) {
        updated.projects = optimizedData.projects;
      }
      if (optimizedData.skills) {
        updated.skills = optimizedData.skills;
      }

      return updated;
    });

    showStatus("成功采纳 AI 智能优化改写建议！已自动更新到简历中。", 'success');
  };

  if (isPrintRoute) {
    if (!printData) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white font-sans">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-500 font-medium">正在准备打印预览数据...</p>
          </div>
        </div>
      );
    }

    return (
      <div id="printable-resume" className="bg-white min-h-screen overflow-visible font-sans flex justify-center py-0">
        <ResumePreview
          data={printData.data}
          styles={printData.styles}
          onPageCountChange={() => {}}
          activeFieldId={null}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col antialiased text-slate-800">
      {/* 1. Clean Global Header (no-print) */}
      <header className="bg-white border-b border-slate-200/50 py-3 px-6 sticky top-0 z-40 no-print">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 text-blue-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight flex items-center gap-2">
                Resume Studio
                <span className="text-xs text-slate-400 font-normal">|</span>
                <span className="text-xs text-slate-500 font-normal">AI 简历排版工作台</span>
              </h1>
              <p className="text-[11px] text-slate-400">内容优化、自适应版式调整与 PDF 高清导出</p>
            </div>
          </div>

          {/* Clean Action Tools */}
          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />

            {/* Toggle Fullscreen Preview Button */}
            <button
              id="header-preview-fullscreen-toggle-btn"
              type="button"
              onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
              className={`px-3 py-1.5 border text-xs rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                isPreviewExpanded
                  ? "bg-blue-50 text-blue-600 border-blue-250 hover:bg-blue-100/80"
                  : "border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {isPreviewExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              {isPreviewExpanded ? "分栏编辑" : "全屏预览"}
            </button>

            {/* Print Resume */}
            <button
              id="print-browser-nav-btn"
              type="button"
              onClick={() => handlePrintResume()}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 text-xs rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              打印简历
            </button>

            {/* Save as PDF */}
            <button
              id="download-pdf-nav-btn"
              type="button"
              onClick={() => handleExportPDF()}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-1.5 px-4 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? "准备中..." : "保存为 PDF"}
            </button>

            {/* Word Export Button */}
            <button
              id="download-word-nav-btn"
              type="button"
              onClick={handleExportWord}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs py-1.5 px-4 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              导出 Word
            </button>
          </div>
        </div>
      </header>

      {/* 2. Multi-Resume Drafts Workspace Bar (no-print) */}
      <div className="bg-slate-50/50 border-b border-slate-200/40 py-2.5 px-6 no-print">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[13px] font-bold text-slate-900">简历版本</span>
            <span className="text-[11px] text-slate-300 font-normal">|</span>
            <span className="text-[12px] text-slate-500 font-normal">为不同岗位保存不同简历</span>
          </div>
          
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            {savedResumes.map((res) => {
              const isActive = res.id === activeResumeId;
              const isEditing = editingResumeId === res.id;
              return (
                <div
                  key={res.id}
                  className={`group flex items-center gap-1.5 h-[30px] px-3.5 rounded-lg border text-[13px] font-medium transition-all shrink-0 ${
                    isActive
                      ? "bg-blue-50/80 text-blue-700 border-blue-300 font-semibold shadow-3xs"
                      : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingNameVal}
                      onChange={(e) => setEditingNameVal(e.target.value)}
                      onBlur={() => handleSaveRename(res.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(res.id);
                        if (e.key === "Escape") setEditingResumeId(null);
                      }}
                      className="bg-white border border-blue-300 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-blue-800 focus:outline-blue-500 w-[110px]"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSwitchResume(res.id)}
                        className={`cursor-pointer transition-colors ${isActive ? "text-blue-700 font-semibold" : "text-slate-700 hover:text-slate-900"}`}
                        title="点击切换到此简历版本"
                      >
                        {res.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartRename(res.id, res.name)}
                        className="text-slate-400 hover:text-blue-600 p-0.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="重命名版本"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {!isEditing && savedResumes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteResume(res.id)}
                      className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="彻底删除此版本"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              id="new-empty-resume-btn"
              type="button"
              onClick={handleCreateNewResumePrompt}
              className="h-[30px] px-3.5 border border-dashed border-slate-300 hover:border-blue-400 text-slate-600 hover:text-blue-600 text-[13px] rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 bg-white"
              title="新建独立简历版本"
            >
              + 新建版本
            </button>
          </div>
        </div>
      </div>

      {/* Global Toast Status Message */}
      {statusMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in no-print">
          <div className={`p-4 rounded-lg shadow-lg flex items-center gap-2 border ${
            statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            statusMsg.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
            'bg-red-50 border-red-200 text-red-800'
          }`}>
            <CheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
            <span className="text-xs font-semibold">{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher (Visible only on mobile/tablet) */}
      <div className="lg:hidden mx-4 md:mx-6 mt-4 no-print">
        <div className="relative flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 focus:outline-none ${
              mobileTab === 'editor'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            ✍️ 编辑简历信息
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none ${
              mobileTab === 'preview'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            👁️ 实时 A4 预览
            {pageCount > 1 && (
              <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                {pageCount}页
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Workspace (38% left, 62% right) */}
      <main className="max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Side: Editor (38%) */}
        <section id="editor-sidebar-section" className={`w-full lg:w-[38%] shrink-0 space-y-4 no-print ${isPreviewExpanded ? 'hidden' : 'block'} ${mobileTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Editor Header & Auto-save indicator */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                草稿已自动保存 {lastSavedTime && `(${lastSavedTime})`}
              </span>
            </div>
            
            <button
              type="button"
              onClick={handleResetDraft}
              className="text-[11px] text-slate-400 hover:text-red-500 font-medium flex items-center gap-1 transition"
              title="清除所有本地修改并还原到基准模板"
            >
              <RefreshCw className="w-3 h-3" />
              重置内容
            </button>
          </div>

          {/* Compressed Workspace Tab Menu */}
          <div className="relative flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-2xs">
            <button
              id="editor-tab-edit-btn"
              type="button"
              onClick={() => setActiveEditorTab('edit')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 focus:outline-none ${
                activeEditorTab === 'edit'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              内容编辑
            </button>
            <button
              id="editor-tab-style-btn"
              type="button"
              onClick={() => setActiveEditorTab('style')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 focus:outline-none ${
                activeEditorTab === 'style'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              排版样式
            </button>
            <button
              id="editor-tab-optimize-btn"
              type="button"
              onClick={() => setActiveEditorTab('optimize')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 focus:outline-none ${
                activeEditorTab === 'optimize'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              AI 岗位改写
            </button>
            <button
              id="editor-tab-photo-btn"
              type="button"
              onClick={() => setActiveEditorTab('photo')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 focus:outline-none ${
                activeEditorTab === 'photo'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              证件照
            </button>
          </div>

          {/* D. Tab Panel Contents */}
          <div className="transition-all duration-300">
            {activeEditorTab === 'edit' && (
              <div className="space-y-4 animate-fade-in">
                {/* Embedded Dynamic Job & Template Search Selector */}
                <div id="industry-selector-card" className="bg-white rounded-xl border border-slate-200/50 p-4 shadow-2xs space-y-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800">你想投递什么岗位？</span>
                    <p className="text-[11px] text-slate-500 leading-normal">我们会根据目标岗位推荐简历结构、关键词和排版方式</p>
                  </div>

                  {/* Clean Search Input */}
                  <div className="relative">
                    <input
                      id="role-search-input"
                      type="text"
                      placeholder="🔍 输入期望岗位（如：前端、产品、设计师、HR...）"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-3 pr-8 text-xs text-slate-700 placeholder-slate-400 focus:outline-blue-500 focus:bg-white transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold px-1"
                        title="清空搜索"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Filtered/curated results list */}
                  <div className="space-y-2">
                    {searchQuery ? (
                      <div>
                        <span className="text-[10px] text-blue-600 font-bold block mb-1.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          为您精确匹配的行业简历模板 (点击载入)：
                        </span>
                        {filteredTemplates.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-0.5">
                            {filteredTemplates.map(([key, template]) => (
                              <button
                                key={key}
                                type="button"
                                id={`industry-select-${key}-btn`}
                                onClick={() => handleTemplateClick(key)}
                                className={`p-2.5 text-left rounded-xl border flex flex-col justify-between gap-1 transition-all duration-200 cursor-pointer ${
                                  selectedIndustry === key
                                    ? 'bg-blue-50/80 text-blue-900 border-blue-400 shadow-xs ring-2 ring-blue-100'
                                    : 'bg-white text-slate-750 border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-2xs'
                                }`}
                              >
                                <span className="text-[11px] font-bold truncate block w-full">{template.name}</span>
                                <span className="text-[9px] text-slate-450 font-medium truncate block w-full">📂 {template.category}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 text-center py-3 bg-slate-50 rounded-lg">
                            未匹配到该岗位，您可以输入“设计”、“开发”、“运营”等字样
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                          常用热门岗位：
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {recommendedPresets.map(([key, template]: any) => {
                            const isCurrent = selectedIndustry === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                id={`industry-select-${key}-btn`}
                                onClick={() => handleTemplateClick(key)}
                                className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all duration-200 cursor-pointer truncate ${
                                  isCurrent
                                    ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs ring-2 ring-blue-100 font-extrabold'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/20'
                                }`}
                                title={template.name}
                              >
                                {isCurrent ? `✓ ${template.name}` : template.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <ResumeForm
                  data={resumeData}
                  onChange={setResumeData}
                  activeFieldId={activeFieldId}
                  onActiveFieldChange={setActiveFieldId}
                />
              </div>
            )}

            {activeEditorTab === 'style' && (
              <div id="style-customizer-card" className="bg-white rounded-xl border border-slate-200/50 p-5 shadow-2xs space-y-4 animate-fade-in">
                <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    排版与视觉参数
                  </h3>
                  <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100 py-0.5 px-1.5 rounded-md font-medium">A4自适应排版</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                  {/* Template Style Preset */}
                  <Select
                    id="style-template-select"
                    label="简历模板主题"
                    value={resumeStyles.template}
                    onChange={(e) => updateStyles({ template: e.target.value as TemplateType })}
                    options={[
                      { value: "modern", label: "现代极简 (Modern)" },
                      { value: "minimalist", label: "极致纯白 (Minimalist)" },
                      { value: "classic", label: "传统经典 (Classic)" },
                      { value: "creative", label: "艺术创意 (Creative)" },
                      { value: "editorial", label: "学术人文 (Editorial)" },
                    ]}
                  />

                  {/* Layout Column configuration */}
                  <Select
                    id="style-layout-select"
                    label="双栏/单栏排版"
                    value={resumeStyles.layout}
                    onChange={(e) => updateStyles({ layout: e.target.value as any })}
                    options={[
                      { value: "one-column", label: "经典单栏" },
                      { value: "two-column-right", label: "双栏 (右侧边栏)" },
                      { value: "two-column-left", label: "双栏 (左侧边栏)" },
                    ]}
                  />

                  {/* Spacing density */}
                  <Select
                    id="style-spacing-select"
                    label="内容紧凑度"
                    value={resumeStyles.spacing}
                    onChange={(e) => updateStyles({ spacing: e.target.value as any })}
                    options={[
                      { value: "compact", label: "紧凑 (适合内容多)" },
                      { value: "normal", label: "适中 (标准间距)" },
                      { value: "relaxed", label: "宽松 (适合内容少)" },
                    ]}
                  />

                  {/* Font Family selection */}
                  <Select
                    id="style-font-family-select"
                    label="英中双语字体"
                    value={resumeStyles.fontFamily}
                    onChange={(e) => updateStyles({ fontFamily: e.target.value as any })}
                    options={[
                      { value: "sans", label: "黑体 (现代极简无衬线)" },
                      { value: "serif", label: "宋体/楷体 (雅致有衬线)" },
                      { value: "mono", label: "等宽体 (硬核技术流)" },
                    ]}
                  />

                  {/* Font Size level */}
                  <Select
                    id="style-font-size-select"
                    label="字号字重比例"
                    value={resumeStyles.fontSize}
                    onChange={(e) => updateStyles({ fontSize: e.target.value as any })}
                    options={[
                      { value: "sm", label: "偏小 (12px / 精致)" },
                      { value: "base", label: "标准 (14px / 易读)" },
                      { value: "lg", label: "偏大 (16px / 清晰)" },
                    ]}
                  />

                  {/* Accent Color Palette */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">视觉强调色</label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => updateStyles({ primaryColor: color.hex })}
                          className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                            resumeStyles.primaryColor === color.hex ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.label}
                        />
                      ))}
                      <input
                        type="color"
                        value={resumeStyles.primaryColor}
                        onChange={(e) => updateStyles({ primaryColor: e.target.value })}
                        className="w-4 h-4 rounded-full border border-slate-300 p-0 cursor-pointer overflow-hidden bg-transparent"
                        title="自定义调色盘"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeEditorTab === 'optimize' && (
              <div className="animate-fade-in">
                <JDOptimizer resumeData={resumeData} onAdoptSuggestion={handleAdoptAISuggestions} />
              </div>
            )}

            {activeEditorTab === 'photo' && (
              <div className="animate-fade-in">
                <AIDocumentPhoto
                  currentAvatar={resumeData.personalInfo.avatar}
                  onChangeAvatar={(url) => setResumeData((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, avatar: url }
                  }))}
                  showAvatar={resumeStyles.showAvatar}
                  onToggleShowAvatar={(show) => updateStyles({ showAvatar: show })}
                />
              </div>
            )}
          </div>
        </section>

        {/* Right Side: A4 Page Preview (62%) */}
        <section id="preview-content-section" className={`transition-all duration-300 lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto ${isPreviewExpanded ? 'w-full' : 'w-full lg:w-[62%] flex-1'} space-y-4 pr-1 scrollbar-thin ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          {/* Printable visual frame */}
          <div className="rounded-xl overflow-x-auto flex justify-center bg-slate-200/20 p-4 border border-slate-200/50 min-h-[1160px] shadow-2xs">
            <ResumePreview
              ref={resumePreviewRef}
              data={resumeData}
              styles={resumeStyles}
              onPageCountChange={setPageCount}
              activeFieldId={activeFieldId}
            />
          </div>
        </section>

      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-slate-200/50 py-5 text-center text-[11px] text-slate-400 no-print mt-auto">
        <div className="max-w-[1440px] mx-auto px-6 space-y-1.5">
          <p>© 2026 Resume Studio · 智能驱动，筑就卓越职途</p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-300">
            <button
              type="button"
              onClick={triggerImportFile}
              className="hover:text-blue-500 hover:underline cursor-pointer transition"
            >
              📂 导入 JSON 备份数据
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={handleExportJSON}
              className="hover:text-blue-500 hover:underline cursor-pointer transition"
            >
              💾 备份当前数据 (JSON)
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Elegant Custom Modal Overlay (no-print) */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4 transition-all scale-100">
            {/* Modal Header */}
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                modalConfig.type === 'template_load' ? 'bg-blue-50 text-blue-600' :
                modalConfig.type === 'create_new' ? 'bg-indigo-50 text-indigo-600' :
                modalConfig.type === 'iframe_print_warning' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                'bg-red-50 text-red-600'
              }`}>
                {modalConfig.type === 'template_load' && <Sparkles className="w-5 h-5" />}
                {modalConfig.type === 'create_new' && <FileText className="w-5 h-5" />}
                {modalConfig.type === 'reset_confirm' && <RefreshCw className="w-5 h-5 animate-spin-reverse" />}
                {modalConfig.type === 'delete_confirm' && <Trash2 className="w-5 h-5" />}
                {modalConfig.type === 'iframe_print_warning' && <Download className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-snug">{modalConfig.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  {modalConfig.type === 'template_load' ? 'MULTI-ROLE WORKSPACE' : 
                   modalConfig.type === 'iframe_print_warning' ? 'BROWSER SANDBOX DETECT' : 'SYSTEM CONFIRM'}
                </p>
              </div>
            </div>

            {/* Modal Description */}
            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
              {modalConfig.description}
            </p>

            {/* Specialized Forms / Inputs if 'create_new' */}
            {modalConfig.type === 'create_new' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">自定义简历版本名称</label>
                  <input
                    type="text"
                    placeholder="例如：高级算法工程师-字节跳动版"
                    value={newManualName}
                    onChange={(e) => setNewManualName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-blue-500 focus:bg-white text-slate-700 font-medium"
                    autoFocus
                  />
                </div>
                <div>
                  <Select
                    label="选择出发岗位基准模板"
                    value={newManualIndustry}
                    onChange={(e) => setNewManualIndustry(e.target.value)}
                    options={Object.entries(INDUSTRY_TEMPLATES).map(([key, opt]) => ({
                      value: key,
                      label: `${opt.name} (${opt.category})`
                    }))}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {modalConfig.type === 'template_load' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleCreateFromTemplateNew(modalConfig.meta.templateKey)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    新建独立版本 (推荐)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOverwriteFromTemplate(modalConfig.meta.templateKey)}
                    className="flex-1 border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-800 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    直接覆盖当前
                  </button>
                </>
              )}

              {modalConfig.type === 'reset_confirm' && (
                <>
                  <button
                    type="button"
                    onClick={performResetDraft}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    确认彻底重置
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                  >
                    保留当前修改
                  </button>
                </>
              )}

              {modalConfig.type === 'delete_confirm' && (
                <>
                  <button
                    type="button"
                    onClick={() => performDeleteResume(modalConfig.meta.resumeId)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    确认彻底删除
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                  >
                    保留版本
                  </button>
                </>
              )}

              {modalConfig.type === 'create_new' && (
                <>
                  <button
                    type="button"
                    onClick={performCreateNewResume}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    立即创建并切换
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                  >
                    取消
                  </button>
                </>
              )}

              {modalConfig.type === 'iframe_print_warning' && (
                <>
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 text-center cursor-pointer"
                  >
                    在新标签页打开 ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setModalConfig(prev => ({ ...prev, isOpen: false }));
                      handlePrintResume();
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    仍要强制打印
                  </button>
                </>
              )}

              {modalConfig.type === 'template_load' && (
                <button
                  type="button"
                  onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                  className="sm:w-auto w-full border border-slate-200 hover:bg-slate-50 text-slate-500 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  取消
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
