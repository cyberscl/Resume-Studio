import React, { useState } from "react";
import { Sparkles, ArrowRight, Check, CheckSquare, BrainCircuit, Loader2, ArrowUpRight, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { ResumeData, ResumeOptimizationResponse } from "../types";

interface JDOptimizerProps {
  resumeData: ResumeData;
  onAdoptSuggestion: (optimizedData: Partial<ResumeData>) => void;
}

export default function JDOptimizer({ resumeData, onAdoptSuggestion }: JDOptimizerProps) {
  const [jd, setJd] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<ResumeOptimizationResponse | null>(null);
  const [originalSnapshot, setOriginalSnapshot] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState<boolean>(true);

  // Track which suggestions have been adopted
  const [adoptedItems, setAdoptedItems] = useState<{
    title?: boolean;
    summary?: boolean;
    skills?: boolean;
    experiences: Record<string, boolean>;
    projects: Record<string, boolean>;
  }>({
    experiences: {},
    projects: {}
  });

  const handleOptimize = async () => {
    if (!jd.trim()) {
      setError("请输入目标岗位的招聘要求 (Job Description)。");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestion(null);
    setOriginalSnapshot(null);
    setAdoptedItems({ experiences: {}, projects: {} });

    try {
      const response = await fetch("/api/ai/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          jobDescription: jd,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "请求失败，请稍后重试");
      }

      const data = await response.json();
      setSuggestion(data);
      // Save current resumeData snapshot so we can revert/undo at any time
      setOriginalSnapshot(JSON.parse(JSON.stringify(resumeData)));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "优化失败。请检查后端连接或确保您的 API Key 是有效的。");
    } finally {
      setLoading(false);
    }
  };

  // Adopt individual sections
  const adoptTitle = () => {
    if (!suggestion) return;
    onAdoptSuggestion({
      personalInfo: {
        ...resumeData.personalInfo,
        title: suggestion.personalInfo.title
      }
    });
    setAdoptedItems(prev => ({ ...prev, title: true }));
  };

  const revertTitle = () => {
    if (!originalSnapshot) return;
    onAdoptSuggestion({
      personalInfo: {
        ...resumeData.personalInfo,
        title: originalSnapshot.personalInfo.title
      }
    });
    setAdoptedItems(prev => ({ ...prev, title: false }));
  };

  const adoptSummary = () => {
    if (!suggestion) return;
    onAdoptSuggestion({
      summary: suggestion.summary.suggested
    });
    setAdoptedItems(prev => ({ ...prev, summary: true }));
  };

  const revertSummary = () => {
    if (!originalSnapshot) return;
    onAdoptSuggestion({
      summary: originalSnapshot.summary
    });
    setAdoptedItems(prev => ({ ...prev, summary: false }));
  };

  const adoptExperience = (expId: string, suggestedText: string, suggestedPosition: string) => {
    const updatedExperiences = resumeData.experiences.map(exp => {
      if (exp.id === expId) {
        return {
          ...exp,
          position: suggestedPosition,
          description: suggestedText
        };
      }
      return exp;
    });

    onAdoptSuggestion({ experiences: updatedExperiences });
    setAdoptedItems(prev => ({
      ...prev,
      experiences: { ...prev.experiences, [expId]: true }
    }));
  };

  const revertExperience = (expId: string) => {
    if (!originalSnapshot) return;
    const originalExp = originalSnapshot.experiences.find(e => e.id === expId);
    if (!originalExp) return;

    const updatedExperiences = resumeData.experiences.map(exp => {
      if (exp.id === expId) {
        return {
          ...exp,
          position: originalExp.position,
          description: originalExp.description
        };
      }
      return exp;
    });

    onAdoptSuggestion({ experiences: updatedExperiences });
    setAdoptedItems(prev => ({
      ...prev,
      experiences: { ...prev.experiences, [expId]: false }
    }));
  };

  const adoptProject = (projId: string, suggestedText: string) => {
    const updatedProjects = resumeData.projects.map(proj => {
      if (proj.id === projId) {
        return {
          ...proj,
          description: suggestedText
        };
      }
      return proj;
    });

    onAdoptSuggestion({ projects: updatedProjects });
    setAdoptedItems(prev => ({
      ...prev,
      projects: { ...prev.projects, [projId]: true }
    }));
  };

  const revertProject = (projId: string) => {
    if (!originalSnapshot) return;
    const originalProj = originalSnapshot.projects.find(p => p.id === projId);
    if (!originalProj) return;

    const updatedProjects = resumeData.projects.map(proj => {
      if (proj.id === projId) {
        return {
          ...proj,
          description: originalProj.description
        };
      }
      return proj;
    });

    onAdoptSuggestion({ projects: updatedProjects });
    setAdoptedItems(prev => ({
      ...prev,
      projects: { ...prev.projects, [projId]: false }
    }));
  };

  const adoptSkills = () => {
    if (!suggestion) return;
    // Add new skills, keep old unique ones
    const addedSkills = suggestion.skills.added;
    const newSkills = Array.from(new Set([...resumeData.skills, ...addedSkills]));

    onAdoptSuggestion({ skills: newSkills });
    setAdoptedItems(prev => ({ ...prev, skills: true }));
  };

  const revertSkills = () => {
    if (!originalSnapshot) return;
    onAdoptSuggestion({ skills: originalSnapshot.skills });
    setAdoptedItems(prev => ({ ...prev, skills: false }));
  };

  const adoptAll = () => {
    if (!suggestion) return;

    // 1. Title
    const personalInfo = {
      ...resumeData.personalInfo,
      title: suggestion.personalInfo.title
    };

    // 2. Summary
    const summary = suggestion.summary.suggested;

    // 3. Experiences
    const experiences = resumeData.experiences.map(exp => {
      const match = suggestion.experiences.find(e => e.id === exp.id);
      if (match) {
        return {
          ...exp,
          position: match.position,
          description: match.suggested
        };
      }
      return exp;
    });

    // 4. Projects
    const projects = resumeData.projects.map(proj => {
      const match = suggestion.projects.find(p => p.id === proj.id);
      if (match) {
        return {
          ...proj,
          description: match.suggested
        };
      }
      return proj;
    });

    // 5. Skills
    const addedSkills = suggestion.skills.added;
    const skills = Array.from(new Set([...resumeData.skills, ...addedSkills]));

    onAdoptSuggestion({
      personalInfo,
      summary,
      experiences,
      projects,
      skills
    });

    // Mark all as adopted
    const updatedExperiencesAdopted: Record<string, boolean> = {};
    suggestion.experiences.forEach(e => { updatedExperiencesAdopted[e.id] = true; });
    
    const updatedProjectsAdopted: Record<string, boolean> = {};
    suggestion.projects.forEach(p => { updatedProjectsAdopted[p.id] = true; });

    setAdoptedItems({
      title: true,
      summary: true,
      skills: true,
      experiences: updatedExperiencesAdopted,
      projects: updatedProjectsAdopted
    });
  };

  const revertAll = () => {
    if (!originalSnapshot) return;
    onAdoptSuggestion({
      personalInfo: {
        ...resumeData.personalInfo,
        title: originalSnapshot.personalInfo.title
      },
      summary: originalSnapshot.summary,
      experiences: resumeData.experiences.map(exp => {
        const orig = originalSnapshot.experiences.find(e => e.id === exp.id);
        return orig ? { ...exp, position: orig.position, description: orig.description } : exp;
      }),
      projects: resumeData.projects.map(proj => {
        const orig = originalSnapshot.projects.find(p => p.id === proj.id);
        return orig ? { ...proj, description: orig.description } : proj;
      }),
      skills: originalSnapshot.skills
    });

    setAdoptedItems({
      title: false,
      summary: false,
      skills: false,
      experiences: {},
      projects: {}
    });
  };

  return (
    <div id="jd-optimizer-card" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 transition-all duration-300">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-base">根据岗位要求 (JD) 智能改写简历</h3>
        </div>
        <button
          id="toggle-jd-panel-btn"
          type="button"
          onClick={() => setShowPanel(!showPanel)}
          className="text-slate-400 hover:text-slate-600 p-1"
        >
          {showPanel ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {showPanel && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 leading-relaxed">
            复制招聘启事中的岗位职责、技术要求等 Job Description (JD) 粘贴到下方，AI 会深度分析并将您的教育、工作、项目及技能词汇与目标岗位进行精细化匹配和改写。
          </div>

          <textarea
            id="jd-input-textarea"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="粘贴目标岗位招聘要求（例如：熟悉 React 18 框架、主导过高并发 SaaS 平台、擅长性能优化、掌握微前端架构等...）"
            rows={4}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-indigo-500 focus:bg-white text-slate-700 leading-relaxed placeholder:text-slate-400 resize-none"
          />

          <button
            id="start-optimize-btn"
            type="button"
            onClick={handleOptimize}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-xl font-medium text-white shadow-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                正在进行全方位岗位精准匹配改写...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI 一键智能改写简历
              </>
            )}
          </button>

          {error && (
            <div id="optimizer-error-alert" className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 leading-relaxed">
              {error}
            </div>
          )}

          {/* Side by side Optimization Preview Panel */}
          {suggestion && (
            <div id="suggestions-preview-box" className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs mt-6 animate-fade-in">
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-4 border-b border-indigo-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI 简历精准匹配改写建议已生成！
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">您可以逐项对比，确认无误后选择性采纳、一键采纳，或随时还原原版。</p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {(adoptedItems.title || adoptedItems.summary || adoptedItems.skills || Object.values(adoptedItems.experiences).some(Boolean) || Object.values(adoptedItems.projects).some(Boolean)) && (
                    <button
                      id="revert-all-btn"
                      type="button"
                      onClick={revertAll}
                      className="bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-medium text-xs py-1.5 px-3 rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      一键还原原版
                    </button>
                  )}
                  <button
                    id="adopt-all-btn"
                    type="button"
                    onClick={adoptAll}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-1.5 px-3 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    全部一键采纳
                  </button>
                </div>
              </div>

              {/* Accordion List for Suggestions */}
              <div className="divide-y divide-slate-100">
                {/* 1. Job Title Suggestion */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-slate-800">1. 匹配的目标职位名称</span>
                    <div className="flex items-center gap-1.5">
                      {adoptedItems.title && (
                        <button
                          type="button"
                          onClick={revertTitle}
                          className="text-[11px] px-2.5 py-1 rounded-md border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <RotateCcw className="w-3 h-3" /> 还原原版
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={adoptTitle}
                        disabled={adoptedItems.title}
                        className={`text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1 transition font-medium ${
                          adoptedItems.title
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-white text-indigo-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20'
                        }`}
                      >
                        {adoptedItems.title ? (
                          <><Check className="w-3.5 h-3.5" /> 已采纳</>
                        ) : (
                          "采纳建议"
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium mb-1">当前：</span>
                      <span className="text-slate-600">{resumeData.personalInfo.title || "（空）"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-indigo-500 font-medium mb-1">建议：</span>
                      <span className="text-indigo-900 font-semibold">{suggestion.personalInfo.title}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Personal Summary Accordion */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-slate-800">2. 核心竞争力总结 (Summary)</span>
                    <div className="flex items-center gap-1.5">
                      {adoptedItems.summary && (
                        <button
                          type="button"
                          onClick={revertSummary}
                          className="text-[11px] px-2.5 py-1 rounded-md border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <RotateCcw className="w-3 h-3" /> 还原原版
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={adoptSummary}
                        disabled={adoptedItems.summary}
                        className={`text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1 transition font-medium ${
                          adoptedItems.summary
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-white text-indigo-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20'
                        }`}
                      >
                        {adoptedItems.summary ? (
                          <><Check className="w-3.5 h-3.5" /> 已采纳</>
                        ) : (
                          "采纳建议"
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[11px] text-indigo-600/80 bg-indigo-50/30 p-2 rounded border border-indigo-100/50">
                      💡 <strong>改写解析：</strong> {suggestion.summary.explanation}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50 text-slate-500">
                        <span className="block text-[10px] font-semibold text-slate-400 mb-1">原版总结：</span>
                        <p className="line-clamp-4">{resumeData.summary || "（空）"}</p>
                      </div>
                      <div className="border border-indigo-100 p-2.5 rounded-lg bg-indigo-50/10 text-indigo-950">
                        <span className="block text-[10px] font-semibold text-indigo-500 mb-1">改写建议：</span>
                        <p className="font-medium leading-relaxed">{suggestion.summary.suggested}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Work Experience Accordion */}
                <div className="p-4 bg-white">
                  <span className="font-semibold text-xs text-slate-800 block mb-3">3. 工作经验匹配优化 (Experiences)</span>
                  <div className="space-y-4">
                    {suggestion.experiences.map((exp) => (
                      <div key={exp.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-xs text-slate-700">
                            {exp.company} | <span className="text-indigo-600">{exp.position}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {adoptedItems.experiences[exp.id] && (
                              <button
                                type="button"
                                onClick={() => revertExperience(exp.id)}
                                className="text-[10px] px-2 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition flex items-center gap-1 cursor-pointer font-medium"
                              >
                                <RotateCcw className="w-2.5 h-2.5" /> 还原原版
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => adoptExperience(exp.id, exp.suggested, exp.position)}
                              disabled={adoptedItems.experiences[exp.id]}
                              className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 transition font-medium ${
                                adoptedItems.experiences[exp.id]
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-white text-indigo-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20'
                              }`}
                            >
                              {adoptedItems.experiences[exp.id] ? (
                                <><Check className="w-3 h-3" /> 已采纳</>
                              ) : (
                                "采纳本项"
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="text-[11px] text-amber-700/95 bg-amber-50/50 p-2 rounded border border-amber-100/50 mb-2 leading-relaxed">
                          💡 <strong>改写亮点：</strong> {exp.explanation}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-500 whitespace-pre-wrap leading-relaxed max-h-[150px] overflow-y-auto">
                            <span className="block text-[10px] text-slate-400 font-medium mb-1">原始经验：</span>
                            {exp.original}
                          </div>
                          <div className="p-2 bg-indigo-50/10 rounded border border-indigo-100/50 text-indigo-900 font-medium whitespace-pre-wrap leading-relaxed max-h-[150px] overflow-y-auto">
                            <span className="block text-[10px] text-indigo-500 font-semibold mb-1">建议改写：</span>
                            {exp.suggested}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Project Experience Accordion */}
                {suggestion.projects.length > 0 && (
                  <div className="p-4 bg-white">
                    <span className="font-semibold text-xs text-slate-800 block mb-3">4. 项目经验匹配优化 (Projects)</span>
                    <div className="space-y-4">
                      {suggestion.projects.map((proj) => (
                        <div key={proj.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs text-slate-700">{proj.name}</span>
                            <div className="flex items-center gap-1.5">
                              {adoptedItems.projects[proj.id] && (
                                <button
                                  type="button"
                                  onClick={() => revertProject(proj.id)}
                                  className="text-[10px] px-2 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition flex items-center gap-1 cursor-pointer font-medium"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" /> 还原原版
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => adoptProject(proj.id, proj.suggested)}
                                disabled={adoptedItems.projects[proj.id]}
                                className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 transition font-medium ${
                                  adoptedItems.projects[proj.id]
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-white text-indigo-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20'
                                }`}
                              >
                                {adoptedItems.projects[proj.id] ? (
                                  <><Check className="w-3 h-3" /> 已采纳</>
                                ) : (
                                  "采纳本项"
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="text-[11px] text-indigo-600/80 bg-indigo-50/30 p-2 rounded border border-indigo-100/50 mb-2 leading-relaxed">
                            💡 {proj.explanation}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-500 whitespace-pre-wrap leading-relaxed">
                              <span className="block text-[10px] text-slate-400 font-medium mb-1">原始项目：</span>
                              {proj.original}
                            </div>
                            <div className="p-2 bg-indigo-50/10 rounded border border-indigo-100/50 text-indigo-900 font-medium whitespace-pre-wrap leading-relaxed">
                              <span className="block text-[10px] text-indigo-500 font-semibold mb-1">建议改写：</span>
                              {proj.suggested}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Skills Optimization */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-slate-800">5. 核心技能优化拓展</span>
                    <div className="flex items-center gap-1.5">
                      {adoptedItems.skills && (
                        <button
                          type="button"
                          onClick={revertSkills}
                          className="text-[11px] px-2.5 py-1 rounded-md border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <RotateCcw className="w-3 h-3" /> 还原原版
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={adoptSkills}
                        disabled={adoptedItems.skills}
                        className={`text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1 transition font-medium ${
                          adoptedItems.skills
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-white text-indigo-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20'
                        }`}
                      >
                        {adoptedItems.skills ? (
                          <><Check className="w-3.5 h-3.5" /> 已采纳</>
                        ) : (
                          "采纳拓展词汇"
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="block text-[10px] text-slate-400 font-medium mb-2">🎯 AI 根据 JD 建议您重点添加的关键词：</span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestion.skills.added.map((skill, index) => (
                          <span key={index} className="bg-indigo-50 text-indigo-700 border border-indigo-100/50 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <ArrowUpRight className="w-2.5 h-2.5" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
