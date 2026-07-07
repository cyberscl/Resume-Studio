import React, { useState } from "react";
import { Plus, Trash2, Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, FolderGit, Cpu, User, AlignLeft, FileText, ChevronUp, ChevronDown, ArrowUpDown, GripVertical } from "lucide-react";
import { ResumeData, Experience, Education, Project } from "../types";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  activeFieldId?: string | null;
  onActiveFieldChange?: (id: string | null) => void;
}

export default function ResumeForm({ data, onChange, activeFieldId, onActiveFieldChange }: ResumeFormProps) {
  const [draggedExpIndex, setDraggedExpIndex] = useState<number | null>(null);
  const [draggedProjIndex, setDraggedProjIndex] = useState<number | null>(null);
  const [canDragExp, setCanDragExp] = useState(false);
  const [canDragProj, setCanDragProj] = useState(false);

  const handleExpDragStart = (e: React.DragEvent, index: number) => {
    setDraggedExpIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleExpDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedExpIndex === null || draggedExpIndex === index) return;

    const updated = [...data.experiences];
    const itemToMove = updated[draggedExpIndex];
    updated.splice(draggedExpIndex, 1);
    updated.splice(index, 0, itemToMove);
    
    setDraggedExpIndex(index);
    onChange({ ...data, experiences: updated });
  };

  const handleExpDragEnd = () => {
    setDraggedExpIndex(null);
  };

  const handleProjDragStart = (e: React.DragEvent, index: number) => {
    setDraggedProjIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProjDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedProjIndex === null || draggedProjIndex === index) return;

    const updated = [...data.projects];
    const itemToMove = updated[draggedProjIndex];
    updated.splice(draggedProjIndex, 1);
    updated.splice(index, 0, itemToMove);

    setDraggedProjIndex(index);
    onChange({ ...data, projects: updated });
  };

  const handleProjDragEnd = () => {
    setDraggedProjIndex(null);
  };

  // Helper for parsing dates in resume to support sorting
  const parseResumeDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    const normalized = dateStr.trim();
    if (
      normalized === "至今" ||
      normalized === "Present" ||
      normalized === "present" ||
      normalized.includes("今")
    ) {
      return Date.now() + 100000000000; // Far future so it always stays on top for desc sorting
    }
    const parts = normalized.split("-");
    if (parts.length >= 1) {
      const year = parseInt(parts[0], 10);
      const month = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : 0;
      if (!isNaN(year)) {
        return new Date(year, month, 1).getTime();
      }
    }
    const d = Date.parse(normalized);
    return isNaN(d) ? 0 : d;
  };

  // Sort experiences automatically by date
  const sortExperiencesByDate = (order: 'desc' | 'asc' = 'desc') => {
    const sorted = [...data.experiences].sort((a, b) => {
      const dateEndA = parseResumeDate(a.endDate || a.startDate);
      const dateEndB = parseResumeDate(b.endDate || b.startDate);
      
      if (dateEndA !== dateEndB) {
        return order === 'desc' ? dateEndB - dateEndA : dateEndA - dateEndB;
      }
      
      const dateStartA = parseResumeDate(a.startDate);
      const dateStartB = parseResumeDate(b.startDate);
      return order === 'desc' ? dateStartB - dateStartA : dateStartA - dateStartB;
    });
    onChange({ ...data, experiences: sorted });
  };

  // Sort projects automatically by date
  const sortProjectsByDate = (order: 'desc' | 'asc' = 'desc') => {
    const sorted = [...data.projects].sort((a, b) => {
      const dateEndA = parseResumeDate(a.endDate || a.startDate);
      const dateEndB = parseResumeDate(b.endDate || b.startDate);
      
      if (dateEndA !== dateEndB) {
        return order === 'desc' ? dateEndB - dateEndA : dateEndA - dateEndB;
      }
      
      const dateStartA = parseResumeDate(a.startDate);
      const dateStartB = parseResumeDate(b.startDate);
      return order === 'desc' ? dateStartB - dateStartA : dateStartA - dateStartB;
    });
    onChange({ ...data, projects: sorted });
  };

  // Move experience manual sorting
  const moveExperience = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.experiences.length) return;
    
    const updated = [...data.experiences];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    onChange({ ...data, experiences: updated });
  };

  // Move project manual sorting
  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.projects.length) return;
    
    const updated = [...data.projects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    onChange({ ...data, projects: updated });
  };

  // Personal Info helpers
  const handlePersonalInfoChange = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  // Experiences helpers
  const handleExperienceChange = (id: string, field: keyof Experience, value: string) => {
    const updated = data.experiences.map((exp) => {
      if (exp.id === id) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    onChange({ ...data, experiences: updated });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      company: "（未命名公司）",
      position: "（职位名称）",
      startDate: "2024-01",
      endDate: "至今",
      description: "• 请在此输入工作职责和核心业绩成果\n• 支持 markdown 式要点句",
    };
    onChange({
      ...data,
      experiences: [...data.experiences, newExp],
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experiences: data.experiences.filter((exp) => exp.id !== id),
    });
  };

  // Educations helpers
  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    const updated = data.educations.map((edu) => {
      if (edu.id === id) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    onChange({ ...data, educations: updated });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: `edu_${Date.now()}`,
      school: "（未命名学校）",
      major: "（专业名称）",
      degree: "学士",
      startDate: "2020-09",
      endDate: "2024-06",
      description: "主修课程/曾获荣誉",
    };
    onChange({
      ...data,
      educations: [...data.educations, newEdu],
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      educations: data.educations.filter((edu) => edu.id !== id),
    });
  };

  // Projects helpers
  const handleProjectChange = (id: string, field: keyof Project, value: string) => {
    const updated = data.projects.map((proj) => {
      if (proj.id === id) {
        return { ...proj, [field]: value };
      }
      return proj;
    });
    onChange({ ...data, projects: updated });
  };

  const addProject = () => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: "（项目名称）",
      role: "（项目角色/技术主导）",
      startDate: "2024-01",
      endDate: "2024-03",
      description: "描述项目背景、所用技术以及您做出的具体贡献及量化成果。",
    };
    onChange({
      ...data,
      projects: [...data.projects, newProj],
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((proj) => proj.id !== id),
    });
  };

  // Skills helpers
  const [skillsInput, setSkillsInput] = React.useState(() => data.skills.join(", "));

  React.useEffect(() => {
    const parseTags = (value: string) => {
      const hasCommas = value.includes(",") || value.includes("，") || value.includes("\n");
      const separators = hasCommas ? /[,，\n]+/ : /[\s]+/;
      return Array.from(
        new Set(
          value
            .split(separators)
            .map(item => item.trim())
            .filter(Boolean)
        )
      );
    };
    const currentParsed = parseTags(skillsInput);
    if (JSON.stringify(currentParsed) !== JSON.stringify(data.skills)) {
      setSkillsInput(data.skills.join(", "));
    }
  }, [data.skills, skillsInput]);

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSkillsInput(val);
    const parseTags = (value: string) => {
      const hasCommas = value.includes(",") || value.includes("，") || value.includes("\n");
      const separators = hasCommas ? /[,，\n]+/ : /[\s]+/;
      return Array.from(
        new Set(
          value
            .split(separators)
            .map(item => item.trim())
            .filter(Boolean)
        )
      );
    };
    const list = parseTags(val);
    onChange({ ...data, skills: list });
  };

  return (
    <div className="space-y-6">
      {/* 1. Personal Information */}
      <div id="section-personal-info" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-base">基本信息</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">姓名</label>
            <input
              id="input-personal-name"
              type="text"
              value={data.personalInfo.name}
              onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
              onFocus={() => onActiveFieldChange?.("basic-name")}
              onBlur={() => onActiveFieldChange?.(null)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-indigo-500 focus:bg-white text-slate-800"
              placeholder="张三"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">专业意向 / 职位名称</label>
            <input
              id="input-personal-title"
              type="text"
              value={data.personalInfo.title}
              onChange={(e) => handlePersonalInfoChange("title", e.target.value)}
              onFocus={() => onActiveFieldChange?.("basic-title")}
              onBlur={() => onActiveFieldChange?.(null)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-indigo-500 focus:bg-white text-slate-800"
              placeholder="前端开发工程师"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" /> 电子邮箱
            </label>
            <input
              id="input-personal-email"
              type="email"
              value={data.personalInfo.email}
              onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
              onFocus={() => onActiveFieldChange?.("basic-email")}
              onBlur={() => onActiveFieldChange?.(null)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-indigo-500 focus:bg-white text-slate-800"
              placeholder="zhangsan@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" /> 手机号码
            </label>
            <input
              id="input-personal-phone"
              type="tel"
              value={data.personalInfo.phone}
              onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
              onFocus={() => onActiveFieldChange?.("basic-phone")}
              onBlur={() => onActiveFieldChange?.(null)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-indigo-500 focus:bg-white text-slate-800"
              placeholder="138-0000-0000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> 所在地区 / 意向城市
            </label>
            <input
              id="input-personal-location"
              type="text"
              value={data.personalInfo.location}
              onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
              onFocus={() => onActiveFieldChange?.("basic-location")}
              onBlur={() => onActiveFieldChange?.(null)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-indigo-500 focus:bg-white text-slate-800"
              placeholder="北京 · 海淀"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" /> 个人网站 / GitHub / 博客
            </label>
            <input
              id="input-personal-website"
              type="text"
              value={data.personalInfo.website}
              onChange={(e) => handlePersonalInfoChange("website", e.target.value)}
              onFocus={() => onActiveFieldChange?.("basic-website")}
              onBlur={() => onActiveFieldChange?.(null)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-indigo-500 focus:bg-white text-slate-800"
              placeholder="github.com/yourusername"
            />
          </div>
        </div>
      </div>

      {/* 2. Professional Summary */}
      <div id="section-summary" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <AlignLeft className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-base">个人总结 / 核心优势</h3>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            简明扼要地总结您的职业生涯、擅长领域或重要里程碑 (约 150-200 字)。
          </label>
          <textarea
            id="input-personal-summary"
            value={data.summary}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
            onFocus={() => onActiveFieldChange?.("summary")}
            onBlur={() => onActiveFieldChange?.(null)}
            rows={4}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:outline-indigo-500 focus:bg-white text-slate-800 leading-relaxed placeholder:text-slate-400 resize-none"
            placeholder="例如：5年资深前端工程师。精通React生态，对大前端工程化及大型重构有着丰富实践经验。曾带队重构核心产品，实现页面流失率大幅降低，注重细节与用户交互，具备优异的技术攻坚力与团队协调力。"
          />
        </div>
      </div>

      {/* 3. Work Experiences */}
      <div id="section-experiences" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-base">工作经历</h3>
          </div>
          <div className="flex items-center gap-2">
            {data.experiences.length > 1 && (
              <button
                type="button"
                onClick={() => sortExperiencesByDate('desc')}
                className="text-xs text-slate-500 hover:text-indigo-650 border border-slate-200 hover:border-indigo-100 bg-white hover:bg-indigo-50/50 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="按时间最新到最旧自动排序"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                时间降序
              </button>
            )}
            <button
              id="add-experience-btn"
              type="button"
              onClick={addExperience}
              className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              添加工作经历
            </button>
          </div>
        </div>

        {data.experiences.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            暂无工作经历，点击右上角按钮添加。
          </div>
        ) : (
          <div className="space-y-5">
            {data.experiences.map((exp, index) => {
              const isDragged = draggedExpIndex === index;
              return (
                <div
                  key={exp.id}
                  draggable={canDragExp}
                  onDragStart={(e) => handleExpDragStart(e, index)}
                  onDragOver={(e) => handleExpDragOver(e, index)}
                  onDragEnd={() => {
                    handleExpDragEnd();
                    setCanDragExp(false);
                  }}
                  className={`p-4 rounded-xl border space-y-3 relative group transition-all duration-200 ${
                    isDragged
                      ? "border-indigo-400 bg-indigo-50/20 opacity-60 scale-[0.98] shadow-md"
                      : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Drag Handle */}
                      <div
                        onMouseDown={() => setCanDragExp(true)}
                        onMouseUp={() => setCanDragExp(false)}
                        onTouchStart={() => setCanDragExp(true)}
                        onTouchEnd={() => setCanDragExp(false)}
                        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition"
                        title="拖动调整顺序"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        经历 {index + 1}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-white border border-transparent hover:border-slate-100 transition shadow-xs cursor-pointer"
                      title="删除此项"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">公司/企业名称</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`work-${index}-company`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800 font-medium"
                      placeholder="XX科技股份有限公司"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">担任职位</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(exp.id, "position", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`work-${index}-position`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                      placeholder="资深前端开发"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">开始时间 (YYYY-MM)</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(exp.id, "startDate", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`work-${index}-period`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                      placeholder="2021-09"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">结束时间 (YYYY-MM 或 '至今')</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(exp.id, "endDate", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`work-${index}-period`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                      placeholder="至今"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">工作职责与核心产出业绩（支持多行 • 要点）</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                    onFocus={() => onActiveFieldChange?.(`work-${index}-description`)}
                    onBlur={() => onActiveFieldChange?.(null)}
                    rows={4}
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs focus:outline-indigo-500 text-slate-800 leading-relaxed placeholder:text-slate-400 resize-none font-mono"
                    placeholder="• 主导微前端核心项目重构，提升团队编译打包速度。\n• 负责某某复杂交互的开发和交付，提高业务产出效率..."
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* 4. Project Experiences */}
      <div id="section-projects" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FolderGit className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-base">项目经验</h3>
          </div>
          <div className="flex items-center gap-2">
            {data.projects.length > 1 && (
              <button
                type="button"
                onClick={() => sortProjectsByDate('desc')}
                className="text-xs text-slate-500 hover:text-indigo-650 border border-slate-200 hover:border-indigo-100 bg-white hover:bg-indigo-50/50 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="按时间最新到最旧自动排序"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                时间降序
              </button>
            )}
            <button
              id="add-project-btn"
              type="button"
              onClick={addProject}
              className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              添加项目经验
            </button>
          </div>
        </div>

        {data.projects.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            暂无项目经验，点击右上角按钮添加。
          </div>
        ) : (
          <div className="space-y-5">
            {data.projects.map((proj, index) => {
              const isDragged = draggedProjIndex === index;
              return (
                <div
                  key={proj.id}
                  draggable={canDragProj}
                  onDragStart={(e) => handleProjDragStart(e, index)}
                  onDragOver={(e) => handleProjDragOver(e, index)}
                  onDragEnd={() => {
                    handleProjDragEnd();
                    setCanDragProj(false);
                  }}
                  className={`p-4 rounded-xl border space-y-3 relative group transition-all duration-200 ${
                    isDragged
                      ? "border-teal-400 bg-teal-50/20 opacity-60 scale-[0.98] shadow-md"
                      : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Drag Handle */}
                      <div
                        onMouseDown={() => setCanDragProj(true)}
                        onMouseUp={() => setCanDragProj(false)}
                        onTouchStart={() => setCanDragProj(true)}
                        onTouchEnd={() => setCanDragProj(false)}
                        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition"
                        title="拖动调整顺序"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <span className="inline-block bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        项目 {index + 1}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-white border border-transparent hover:border-slate-100 transition shadow-xs cursor-pointer"
                      title="删除此项"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">项目名称</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => handleProjectChange(proj.id, "name", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`project-${index}-title`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800 font-medium"
                      placeholder="XX可视化建站引擎"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">项目角色 / 核心技术栈</label>
                    <input
                      type="text"
                      value={proj.role}
                      onChange={(e) => handleProjectChange(proj.id, "role", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`project-${index}-title`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                      placeholder="核心架构师 & 主导开发"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">开始时间 (YYYY-MM)</label>
                    <input
                      type="text"
                      value={proj.startDate}
                      onChange={(e) => handleProjectChange(proj.id, "startDate", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`project-${index}-period`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                      placeholder="2023-03"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">结束时间 (YYYY-MM)</label>
                    <input
                      type="text"
                      value={proj.endDate}
                      onChange={(e) => handleProjectChange(proj.id, "endDate", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`project-${index}-period`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                      placeholder="2023-08"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">项目详细描述（开发工作、面临难点、具体成效）</label>
                  <textarea
                    value={proj.description}
                    onChange={(e) => handleProjectChange(proj.id, "description", e.target.value)}
                    onFocus={() => onActiveFieldChange?.(`project-${index}-bullets`)}
                    onBlur={() => onActiveFieldChange?.(null)}
                    rows={4}
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs focus:outline-indigo-500 text-slate-800 leading-relaxed placeholder:text-slate-400 resize-none font-mono"
                    placeholder="描述该项目要解决的痛点，使用了哪些前沿技术方案，以及具体的个人产出和可量化指标。"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* 5. Education History */}
      <div id="section-education" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-base">教育背景</h3>
          </div>
          <button
            id="add-education-btn"
            type="button"
            onClick={addEducation}
            className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            添加教育背景
          </button>
        </div>

        {data.educations.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            暂无教育背景，点击右上角按钮添加。
          </div>
        ) : (
          <div className="space-y-5">
            {data.educations.map((edu, index) => (
              <div key={edu.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-white border border-transparent hover:border-slate-100 transition shadow-xs cursor-pointer"
                  title="删除此项"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <span className="inline-block bg-purple-50 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded-sm">
                  教育 {index + 1}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">毕业院校/大学</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`education-${index}-school`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800 font-medium"
                      placeholder="北京邮电大学"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">主修专业</label>
                    <input
                      type="text"
                      value={edu.major}
                      onChange={(e) => handleEducationChange(edu.id, "major", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`education-${index}-major`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                      placeholder="计算机科学与技术"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">学历 / 学位</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                      onFocus={() => onActiveFieldChange?.(`education-${index}-major`)}
                      onBlur={() => onActiveFieldChange?.(null)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                      placeholder="学士"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">入学时间</label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => handleEducationChange(edu.id, "startDate", e.target.value)}
                        onFocus={() => onActiveFieldChange?.(`education-${index}-period`)}
                        onBlur={() => onActiveFieldChange?.(null)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                        placeholder="2018-09"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">毕业时间</label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(edu.id, "endDate", e.target.value)}
                        onFocus={() => onActiveFieldChange?.(`education-${index}-period`)}
                        onBlur={() => onActiveFieldChange?.(null)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                        placeholder="2022-06"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">主修课程 / 个人荣誉 (GPA、校级等)</label>
                  <input
                    type="text"
                    value={edu.description || ""}
                    onChange={(e) => handleEducationChange(edu.id, "description", e.target.value)}
                    onFocus={() => onActiveFieldChange?.(`education-${index}-description`)}
                    onBlur={() => onActiveFieldChange?.(null)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800"
                    placeholder="成绩排名前 5%，曾获国家奖学金、优秀学生干部荣誉"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Skills Core Vocabulary */}
      <div id="section-skills" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-base">专业技能 / 关键词标签</h3>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            输入技能关键词，支持空格、英文逗号、中文逗号分隔。
          </label>
          <input
            id="input-personal-skills"
            type="text"
            value={skillsInput}
            onChange={handleSkillsChange}
            onFocus={() => onActiveFieldChange?.("skills-list")}
            onBlur={() => onActiveFieldChange?.(null)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-indigo-500 focus:bg-white text-slate-800 font-mono"
            placeholder="React TypeScript Node.js Git 性能优化"
          />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
