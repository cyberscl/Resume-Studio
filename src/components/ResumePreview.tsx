import React from "react";
import { Mail, Phone, MapPin, Globe, Award, Briefcase, GraduationCap, Code, FolderGit } from "lucide-react";
import { ResumeData, ResumeStyles } from "../types";

export interface ResumePreviewRef {
  scrollToField: (fieldId: string) => void;
}

interface ResumePreviewProps {
  data: ResumeData;
  styles: ResumeStyles;
  onPageCountChange?: (count: number) => void;
  activeFieldId?: string | null;
}

const ResumePreview = React.forwardRef<ResumePreviewRef, ResumePreviewProps>(
  function ResumePreview({ data, styles, onPageCountChange, activeFieldId: propActiveFieldId }, ref) {
    const isPrintRoute = typeof window !== "undefined" && (window.location.pathname === "/print" || window.location.pathname.startsWith("/resume-print"));
    const [blockHeights, setBlockHeights] = React.useState<Record<string, number>>({});
    const [activeFieldId, setActiveFieldId] = React.useState<string | null>(null);
    const highlightTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const { personalInfo, experiences, educations, projects, skills, summary } = data;
    const {
      template,
      primaryColor,
      textColor,
      fontSize,
      fontFamily,
      spacing,
      layout,
      showAvatar,
    } = styles;

    // Measure block heights when data or styles change
    React.useEffect(() => {
      const timer = setTimeout(() => {
        const elements = document.querySelectorAll("[data-block-id]");
        const heights: Record<string, number> = {};
        elements.forEach((el) => {
          const id = el.getAttribute("data-block-id");
          if (id) {
            heights[id] = (el as HTMLElement).offsetHeight;
          }
        });
        setBlockHeights(heights);
      }, 150);
      return () => clearTimeout(timer);
    }, [data, styles]);

    const scrollToField = React.useCallback((fieldId: string) => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      // Reset highlighted field first to allow animation to re-trigger
      setActiveFieldId(null);

      // We perform scroll inside the next tick
      setTimeout(() => {
        const targetElement = document.querySelector(
          `#resume-printable-area [data-preview-id="${fieldId}"]`
        );
        if (targetElement) {
          let parent = targetElement.parentElement;
          let scrollContainer: HTMLElement | null = null;
          while (parent) {
            const overflow = window.getComputedStyle(parent).overflowY;
            if (overflow === 'auto' || overflow === 'scroll') {
              scrollContainer = parent;
              break;
            }
            parent = parent.parentElement;
          }

          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const targetTopRelativeToContainer = targetRect.top - containerRect.top + scrollContainer.scrollTop;
            const targetHeight = targetRect.height;
            const containerHeight = containerRect.height;
            
            const scrollToY = targetTopRelativeToContainer - (containerHeight / 2) + (targetHeight / 2);
            
            scrollContainer.scrollTo({
              top: scrollToY,
              behavior: "smooth"
            });
          } else {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }

          setActiveFieldId(fieldId);

          // Subtle temporary pulse then fade out entirely
          highlightTimeoutRef.current = setTimeout(() => {
            setActiveFieldId(null);
          }, 1500);
        }
      }, 50);
    }, []);

    React.useImperativeHandle(ref, () => ({
      scrollToField
    }));

    // Scroll active element into view inside the printable area when prop changes
    React.useEffect(() => {
      if (propActiveFieldId) {
        scrollToField(propActiveFieldId);
      }
    }, [propActiveFieldId, scrollToField]);

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
      };
    }, []);

  // Spacing helper classes
  const spacingClasses = {
    compact: "space-y-3 mb-3",
    normal: "space-y-5 mb-5",
    relaxed: "space-y-6 mb-6",
  };

  const itemSpacingClasses = {
    compact: "space-y-2",
    normal: "space-y-4",
    relaxed: "space-y-5",
  };

  const titleSpacingClasses = {
    compact: "pb-1 mb-2",
    normal: "pb-1.5 mb-3.5",
    relaxed: "pb-2 mb-4",
  };

  // Font Family helper classes
  const fontClasses = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
  };

  // Font Size helper classes
  const baseSizeClasses = {
    sm: "text-xs leading-relaxed",
    base: "text-[13px] sm:text-sm leading-relaxed",
    lg: "text-sm sm:text-base leading-relaxed",
  };

  const titleSizeClasses = {
    sm: "text-[11px] tracking-wider",
    base: "text-xs tracking-wider",
    lg: "text-sm tracking-wider",
  };

  const nameSizeClasses = {
    sm: "text-xl sm:text-2xl",
    base: "text-2xl sm:text-3xl",
    lg: "text-3xl sm:text-4xl",
  };

  // Helper: Section title styling based on template
  const renderSectionTitle = (title: string, icon?: React.ReactNode) => {
    const isClassic = template === "classic";
    const isModern = template === "modern";
    const isMinimalist = template === "minimalist";
    const isCreative = template === "creative";
    const isEditorial = template === "editorial";

    if (isClassic) {
      return (
        <div className={`flex flex-col items-center justify-center ${titleSpacingClasses[spacing]}`}>
          <h4
            className={`font-bold tracking-widest text-center uppercase pb-1 border-b-2`}
            style={{ color: primaryColor, borderColor: primaryColor, fontSize: '13px' }}
          >
            {title}
          </h4>
        </div>
      );
    }

    if (isModern) {
      return (
        <div className={`flex items-center gap-2 border-b border-slate-100/80 ${titleSpacingClasses[spacing]}`}>
          <div className="w-1 h-4 rounded-xs shrink-0" style={{ backgroundColor: primaryColor }} />
          <h4 className={`font-bold tracking-wider ${titleSizeClasses[fontSize]} text-slate-900`}>
            {title}
          </h4>
        </div>
      );
    }

    if (isMinimalist) {
      return (
        <div className={`border-b border-slate-100 pb-1.5 ${titleSpacingClasses[spacing]}`}>
          <h4 className={`font-bold uppercase tracking-widest text-[11px] text-slate-500`}>
            {title}
          </h4>
        </div>
      );
    }

    if (isCreative) {
      return (
        <div className={`flex items-center gap-2 border-b border-indigo-100/40 pb-1.5 ${titleSpacingClasses[spacing]}`}>
          {icon && <span style={{ color: primaryColor }} className="opacity-80 shrink-0">{icon}</span>}
          <h4 className={`font-extrabold tracking-wide text-slate-800 ${titleSizeClasses[fontSize]}`}>
            {title}
          </h4>
        </div>
      );
    }

    if (isEditorial) {
      return (
        <div className={`border-b-2 border-double border-slate-350 pb-1 ${titleSpacingClasses[spacing]}`}>
          <h4 className={`font-bold font-serif tracking-widest ${titleSizeClasses[fontSize]} text-slate-900`}>
            {title}
          </h4>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 border-b border-slate-100 pb-1 ${titleSpacingClasses[spacing]}`}>
        <h4 className={`font-bold tracking-wider ${titleSizeClasses[fontSize]}`} style={{ color: primaryColor }}>
          {title}
        </h4>
      </div>
    );
  };

  // Personal Header
  const PersonalHeader = () => {
    const isClassic = template === "classic";
    const isMinimalist = template === "minimalist";
    const isCreative = template === "creative";
    const isEditorial = template === "editorial";

    if (isClassic) {
      return (
        <div className="text-center space-y-2 pb-6 border-b border-slate-200" id="resume-personal-header">
          <h1
            className={`font-bold tracking-wider ${nameSizeClasses[fontSize]} text-slate-900 ${activeFieldId === "basic-name" ? "preview-highlight-active" : ""}`}
            data-preview-id="basic-name"
          >
            {personalInfo.name}
          </h1>
          <p
            className={`text-xs uppercase font-semibold tracking-widest text-slate-500 ${activeFieldId === "basic-title" ? "preview-highlight-active" : ""}`}
            data-preview-id="basic-title"
          >
            {personalInfo.title}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
            {personalInfo.email && (
              <span
                className={activeFieldId === "basic-email" ? "preview-highlight-active" : ""}
                data-preview-id="basic-email"
              >
                {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && <span>•</span>}
            {personalInfo.phone && (
              <span
                className={activeFieldId === "basic-phone" ? "preview-highlight-active" : ""}
                data-preview-id="basic-phone"
              >
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && <span>•</span>}
            {personalInfo.location && (
              <span
                className={activeFieldId === "basic-location" ? "preview-highlight-active" : ""}
                data-preview-id="basic-location"
              >
                {personalInfo.location}
              </span>
            )}
            {personalInfo.website && <span>•</span>}
            {personalInfo.website && (
              <span
                className={`underline ${activeFieldId === "basic-website" ? "preview-highlight-active" : ""}`}
                data-preview-id="basic-website"
              >
                {personalInfo.website}
              </span>
            )}
          </div>
        </div>
      );
    }

    if (isMinimalist) {
      return (
        <div className="pb-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-4" id="resume-personal-header">
          <div className="space-y-1">
            <h1
              className={`font-black tracking-tight text-slate-900 ${nameSizeClasses[fontSize]} ${activeFieldId === "basic-name" ? "preview-highlight-active" : ""}`}
              data-preview-id="basic-name"
            >
              {personalInfo.name}
            </h1>
            <p
              className={`text-xs font-semibold tracking-widest text-slate-400 uppercase ${activeFieldId === "basic-title" ? "preview-highlight-active" : ""}`}
              data-preview-id="basic-title"
            >
              {personalInfo.title}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1.5 text-xs text-slate-600 font-medium md:text-right">
            {personalInfo.phone && (
              <span
                className={activeFieldId === "basic-phone" ? "preview-highlight-active" : ""}
                data-preview-id="basic-phone"
              >
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.email && (
              <span
                className={activeFieldId === "basic-email" ? "preview-highlight-active" : ""}
                data-preview-id="basic-email"
              >
                {personalInfo.email}
              </span>
            )}
            {(personalInfo.location || personalInfo.website) && (
              <span>
                {personalInfo.location && (
                  <span
                    className={activeFieldId === "basic-location" ? "preview-highlight-active" : ""}
                    data-preview-id="basic-location"
                  >
                    {personalInfo.location}
                  </span>
                )}
                {personalInfo.location && personalInfo.website ? " • " : ""}
                {personalInfo.website && (
                  <span
                    className={activeFieldId === "basic-website" ? "preview-highlight-active" : ""}
                    data-preview-id="basic-website"
                  >
                    {personalInfo.website}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 ${
          isEditorial ? "border-slate-300" : "border-slate-100"
        }`}
        id="resume-personal-header"
      >
        <div className="flex-1 space-y-1.5">
          <h1
            className={`font-black tracking-tight ${nameSizeClasses[fontSize]} ${
              isEditorial ? "font-serif" : "font-sans"
            } ${activeFieldId === "basic-name" ? "preview-highlight-active" : ""}`}
            style={{ color: isCreative ? primaryColor : "#0f172a" }}
            data-preview-id="basic-name"
          >
            {personalInfo.name}
          </h1>
          <p
            className={`font-semibold tracking-wide text-slate-500 uppercase ${fontSize === "sm" ? "text-xs" : "text-sm"} ${activeFieldId === "basic-title" ? "preview-highlight-active" : ""}`}
            data-preview-id="basic-title"
          >
            {personalInfo.title}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-2 font-medium">
            {personalInfo.email && (
              <span
                className={`flex items-center gap-1.5 ${activeFieldId === "basic-email" ? "preview-highlight-active" : ""}`}
                data-preview-id="basic-email"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span
                className={`flex items-center gap-1.5 ${activeFieldId === "basic-phone" ? "preview-highlight-active" : ""}`}
                data-preview-id="basic-phone"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span
                className={`flex items-center gap-1.5 ${activeFieldId === "basic-location" ? "preview-highlight-active" : ""}`}
                data-preview-id="basic-location"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                {personalInfo.location}
              </span>
            )}
            {personalInfo.website && (
              <span
                className={`flex items-center gap-1.5 ${activeFieldId === "basic-website" ? "preview-highlight-active" : ""}`}
                data-preview-id="basic-website"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                {personalInfo.website}
              </span>
            )}
          </div>
        </div>

        {/* 1-inch/2-inch Portrait photo frame: beautiful aspect-[3/4] ratio layout */}
        {showAvatar && personalInfo.avatar && (
          <div className="relative w-20 h-28 md:w-24 md:h-[135px] rounded-md overflow-hidden border border-slate-200/60 shadow-xs flex-shrink-0 bg-slate-50">
            <img
              src={personalInfo.avatar}
              alt={personalInfo.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    );
  };

  const SummarySection = () => {
    if (!summary) return null;
    return (
      <div
        id="resume-summary-section"
        className={activeFieldId === "summary" ? "preview-highlight-active" : ""}
        data-preview-id="summary"
      >
        {renderSectionTitle("核心竞争力总结", <Award />)}
        <p className={`text-slate-600 text-justify whitespace-pre-wrap ${baseSizeClasses[fontSize]}`}>
          {summary}
        </p>
      </div>
    );
  };

  const SkillsSectionContent = () => {
    if (!skills || skills.length === 0) return null;
    const isCreative = template === "creative";
    return (
      <div
        className={`flex flex-wrap gap-1.5 pt-1 ${activeFieldId === "skills-list" ? "preview-highlight-active" : ""}`}
        data-preview-id="skills-list"
      >
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded transition ${
              isCreative
                ? "bg-indigo-50/75 text-indigo-800 border border-indigo-100/50"
                : "bg-slate-100/80 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {skill}
          </span>
        ))}
      </div>
    );
  };

  // Core block renderer by ID
  const renderBlockById = (id: string) => {
    if (id === 'personal-info') return <PersonalHeader />;
    if (id === 'summary') return <SummarySection />;
    if (id === 'experiences-header') return renderSectionTitle("工作经历", <Briefcase />);
    if (id.startsWith('experience-')) {
      const expId = id.replace('experience-', '');
      const expIndex = (experiences || []).findIndex(e => e.id === expId);
      const exp = (experiences || []).find(e => e.id === expId);
      if (!exp) return null;
      return (
        <div key={exp.id} className="space-y-1">
          <div className="flex justify-between items-baseline font-semibold text-slate-800 text-xs sm:text-sm">
            <span
              className={`font-bold text-slate-900 ${activeFieldId === `work-${expIndex}-company` ? "preview-highlight-active" : ""}`}
              data-preview-id={`work-${expIndex}-company`}
            >
              {exp.company}
            </span>
            <span
              className={`text-slate-400 font-medium text-xs font-mono ${activeFieldId === `work-${expIndex}-period` ? "preview-highlight-active" : ""}`}
              data-preview-id={`work-${expIndex}-period`}
            >
              {exp.startDate} ~ {exp.endDate}
            </span>
          </div>
          <div className="flex justify-between items-baseline text-xs text-slate-600 font-medium">
            <span
              style={{ color: primaryColor }}
              className={activeFieldId === `work-${expIndex}-position` ? "preview-highlight-active" : ""}
              data-preview-id={`work-${expIndex}-position`}
            >
              {exp.position}
            </span>
          </div>
          <p
            className={`text-slate-600 whitespace-pre-wrap text-justify pt-1 ${baseSizeClasses[fontSize]} ${activeFieldId === `work-${expIndex}-description` ? "preview-highlight-active" : ""}`}
            data-preview-id={`work-${expIndex}-description`}
          >
            {exp.description}
          </p>
        </div>
      );
    }
    if (id === 'projects-header') return renderSectionTitle("项目经验", <FolderGit />);
    if (id.startsWith('project-')) {
      const projId = id.replace('project-', '');
      const projIndex = (projects || []).findIndex(p => p.id === projId);
      const proj = (projects || []).find(p => p.id === projId);
      if (!proj) return null;
      return (
        <div key={proj.id} className="space-y-1">
          <div className="flex justify-between items-baseline font-semibold text-slate-800 text-xs sm:text-sm">
            <span
              className={`font-bold text-slate-900 ${activeFieldId === `project-${projIndex}-title` ? "preview-highlight-active" : ""}`}
              data-preview-id={`project-${projIndex}-title`}
            >
              {proj.name}
            </span>
            <span
              className={`text-slate-400 font-medium text-xs font-mono ${activeFieldId === `project-${projIndex}-period` ? "preview-highlight-active" : ""}`}
              data-preview-id={`project-${projIndex}-period`}
            >
              {proj.startDate} ~ {proj.endDate}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            角色 / 技术栈：
            <span
              style={{ color: primaryColor }}
              className={activeFieldId === `project-${projIndex}-title` ? "preview-highlight-active" : ""}
              data-preview-id={`project-${projIndex}-title`}
            >
              {proj.role}
            </span>
          </div>
          <p
            className={`text-slate-600 whitespace-pre-wrap text-justify pt-1 ${baseSizeClasses[fontSize]} ${activeFieldId === `project-${projIndex}-bullets` ? "preview-highlight-active" : ""}`}
            data-preview-id={`project-${projIndex}-bullets`}
          >
            {proj.description}
          </p>
        </div>
      );
    }
    if (id === 'educations-header') return renderSectionTitle("教育背景", <GraduationCap />);
    if (id.startsWith('education-')) {
      const eduId = id.replace('education-', '');
      const eduIndex = (educations || []).findIndex(e => e.id === eduId);
      const edu = (educations || []).find(e => e.id === eduId);
      if (!edu) return null;
      return (
        <div key={edu.id} className="space-y-0.5">
          <div className="flex justify-between items-baseline font-semibold text-slate-800 text-xs sm:text-sm">
            <span
              className={`font-bold text-slate-900 ${activeFieldId === `education-${eduIndex}-school` ? "preview-highlight-active" : ""}`}
              data-preview-id={`education-${eduIndex}-school`}
            >
              {edu.school}
            </span>
            <span
              className={`text-slate-400 font-medium text-xs font-mono ${activeFieldId === `education-${eduIndex}-period` ? "preview-highlight-active" : ""}`}
              data-preview-id={`education-${eduIndex}-period`}
            >
              {edu.startDate} ~ {edu.endDate}
            </span>
          </div>
          <div className="flex justify-between items-baseline text-xs text-slate-600 font-medium">
            <span
              className={activeFieldId === `education-${eduIndex}-major` ? "preview-highlight-active" : ""}
              data-preview-id={`education-${eduIndex}-major`}
            >
              {edu.major} • {edu.degree}
            </span>
          </div>
          {edu.description && (
            <p
              className={`text-slate-400 italic ${fontSize === "sm" ? "text-[10px]" : "text-xs"} mt-0.5 ${activeFieldId === `education-${eduIndex}-description` ? "preview-highlight-active" : ""}`}
              data-preview-id={`education-${eduIndex}-description`}
            >
              {edu.description}
            </p>
          )}
        </div>
      );
    }
    if (id === 'skills-header') return renderSectionTitle("专业技能", <Code />);
    if (id === 'skills-container') return <SkillsSectionContent />;
    return null;
  };

  // Partitioning Content into Pages
  const A4_CONTENT_HEIGHT = 1010; // 1123px - 96px (p-12 padding) - safety margin

  // 1. One Column Pack
  const oneColumnBlocks = [
    'personal-info',
    summary ? 'summary' : null,
    experiences && experiences.length > 0 ? 'experiences-header' : null,
    ...(experiences || []).map(exp => `experience-${exp.id}`),
    projects && projects.length > 0 ? 'projects-header' : null,
    ...(projects || []).map(proj => `project-${proj.id}`),
    educations && educations.length > 0 ? 'educations-header' : null,
    ...(educations || []).map(edu => `education-${edu.id}`),
    skills && skills.length > 0 ? 'skills-header' : null,
    skills && skills.length > 0 ? 'skills-container' : null,
  ].filter(Boolean) as string[];

  const oneColumnPages: string[][] = [[]];
  let curHeight = 0;

  oneColumnBlocks.forEach((blockId) => {
    const h = blockHeights[blockId] || 70;
    const isFirst = oneColumnPages[oneColumnPages.length - 1].length === 0;
    const space = isFirst ? 0 : 20;

    if (curHeight + h + space <= A4_CONTENT_HEIGHT) {
      oneColumnPages[oneColumnPages.length - 1].push(blockId);
      curHeight += h + space;
    } else {
      // Prevent dangling section header
      const prevPage = oneColumnPages[oneColumnPages.length - 1];
      const lastItem = prevPage[prevPage.length - 1];
      if (lastItem && lastItem.endsWith('-header') && !blockId.endsWith('-header')) {
        prevPage.pop();
        oneColumnPages.push([lastItem, blockId]);
        curHeight = (blockHeights[lastItem] || 40) + h + 20;
      } else {
        oneColumnPages.push([blockId]);
        curHeight = h;
      }
    }
  });

  // 2. Two Column Pack
  const sidebarBlocks = [
    educations && educations.length > 0 ? 'educations-header' : null,
    ...(educations || []).map(edu => `education-${edu.id}`),
    skills && skills.length > 0 ? 'skills-header' : null,
    skills && skills.length > 0 ? 'skills-container' : null,
  ].filter(Boolean) as string[];

  const mainBlocks = [
    summary ? 'summary' : null,
    experiences && experiences.length > 0 ? 'experiences-header' : null,
    ...(experiences || []).map(exp => `experience-${exp.id}`),
    projects && projects.length > 0 ? 'projects-header' : null,
    ...(projects || []).map(proj => `project-${proj.id}`),
  ].filter(Boolean) as string[];

  const sidebarPages: string[][] = [[]];
  let curSidebarH = 0;
  const headerH = blockHeights['personal-info'] || 180;
  let sidebarLimit = A4_CONTENT_HEIGHT - headerH;

  sidebarBlocks.forEach((blockId) => {
    const h = blockHeights[blockId] || 70;
    const isFirst = sidebarPages[sidebarPages.length - 1].length === 0;
    const space = isFirst ? 0 : 20;

    if (curSidebarH + h + space <= sidebarLimit) {
      sidebarPages[sidebarPages.length - 1].push(blockId);
      curSidebarH += h + space;
    } else {
      const prevPage = sidebarPages[sidebarPages.length - 1];
      const lastItem = prevPage[prevPage.length - 1];
      if (lastItem && lastItem.endsWith('-header') && !blockId.endsWith('-header')) {
        prevPage.pop();
        sidebarPages.push([lastItem, blockId]);
        sidebarLimit = A4_CONTENT_HEIGHT;
        curSidebarH = (blockHeights[lastItem] || 40) + h + 20;
      } else {
        sidebarPages.push([blockId]);
        sidebarLimit = A4_CONTENT_HEIGHT;
        curSidebarH = h;
      }
    }
  });

  const mainPages: string[][] = [[]];
  let curMainH = 0;
  let mainLimit = A4_CONTENT_HEIGHT - headerH;

  mainBlocks.forEach((blockId) => {
    const h = blockHeights[blockId] || 70;
    const isFirst = mainPages[mainPages.length - 1].length === 0;
    const space = isFirst ? 0 : 20;

    if (curMainH + h + space <= mainLimit) {
      mainPages[mainPages.length - 1].push(blockId);
      curMainH += h + space;
    } else {
      const prevPage = mainPages[mainPages.length - 1];
      const lastItem = prevPage[prevPage.length - 1];
      if (lastItem && lastItem.endsWith('-header') && !blockId.endsWith('-header')) {
        prevPage.pop();
        mainPages.push([lastItem, blockId]);
        mainLimit = A4_CONTENT_HEIGHT;
        curMainH = (blockHeights[lastItem] || 40) + h + 20;
      } else {
        mainPages.push([blockId]);
        mainLimit = A4_CONTENT_HEIGHT;
        curMainH = h;
      }
    }
  });

  const totalPagesCount = layout === 'one-column'
    ? oneColumnPages.length
    : Math.max(sidebarPages.length, mainPages.length);

  // Sync total page count upwards
  React.useEffect(() => {
    if (onPageCountChange) {
      onPageCountChange(totalPagesCount);
    }
  }, [totalPagesCount, onPageCountChange]);

  return (
    <>
      <style>{`
        @media screen {
          .preview-highlight-active {
            animation: preview-flash 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }
        }
        @keyframes preview-flash {
          0% {
            background-color: rgba(99, 102, 241, 0.15);
            box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.15);
            border-radius: 4px;
          }
          100% {
            background-color: transparent;
            box-shadow: 0 0 0 0 transparent;
            border-radius: 0px;
          }
        }
        @media print {
          body {
            background: white !important;
          }
          .resume-page {
            page-break-after: always !important;
            break-after: page !important;
            height: 1123px !important;
            min-height: 1123px !important;
            max-height: 1123px !important;
            overflow: hidden !important;
            padding: 48px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            background-color: white !important;
          }
          .preview-highlight-active {
            outline: none !important;
          }
        }
      `}</style>

      {/* 1. Flat offscreen measurement container (fully structured to correctly capture heights including margins/paddings) */}
      <div
        id="resume-measure-container"
        className={`absolute -left-[9999px] -top-[9999px] w-[794px] p-12 bg-white text-slate-800 ${fontClasses[fontFamily]} pointer-events-none select-none opacity-0`}
        style={{ color: textColor }}
      >
        <div id="measure-personal-info" data-block-id="personal-info">
          <PersonalHeader />
        </div>
        {summary && (
          <div id="measure-summary" data-block-id="summary" className="mt-5">
            <SummarySection />
          </div>
        )}

        {experiences && experiences.length > 0 && (
          <>
            <div id="measure-experiences-header" data-block-id="experiences-header" className="mt-5">
              {renderSectionTitle("工作经历", <Briefcase />)}
            </div>
            {(experiences || []).map((exp) => (
              <div key={exp.id} id={`measure-experience-${exp.id}`} data-block-id={`experience-${exp.id}`} className="mt-5">
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline font-semibold text-slate-800 text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">{exp.company}</span>
                    <span className="text-slate-400 font-medium text-xs font-mono">{exp.startDate} ~ {exp.endDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-slate-600 font-medium">
                    <span style={{ color: primaryColor }}>{exp.position}</span>
                  </div>
                  <p className={`text-slate-600 whitespace-pre-wrap text-justify pt-1 ${baseSizeClasses[fontSize]}`}>
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {projects && projects.length > 0 && (
          <>
            <div id="measure-projects-header" data-block-id="projects-header" className="mt-5">
              {renderSectionTitle("项目经验", <FolderGit />)}
            </div>
            {(projects || []).map((proj) => (
              <div key={proj.id} id={`measure-project-${proj.id}`} data-block-id={`project-${proj.id}`} className="mt-5">
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline font-semibold text-slate-800 text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">{proj.name}</span>
                    <span className="text-slate-400 font-medium text-xs font-mono">{proj.startDate} ~ {proj.endDate}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    角色 / 技术栈：<span style={{ color: primaryColor }}>{proj.role}</span>
                  </div>
                  <p className={`text-slate-600 whitespace-pre-wrap text-justify pt-1 ${baseSizeClasses[fontSize]}`}>
                    {proj.description}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {educations && educations.length > 0 && (
          <>
            <div id="measure-educations-header" data-block-id="educations-header" className="mt-5">
              {renderSectionTitle("教育背景", <GraduationCap />)}
            </div>
            {(educations || []).map((edu) => (
              <div key={edu.id} id={`measure-education-${edu.id}`} data-block-id={`education-${edu.id}`} className="mt-5">
                <div className="space-y-0.5">
                  <div className="flex justify-between items-baseline font-semibold text-slate-800 text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">{edu.school}</span>
                    <span className="text-slate-400 font-medium text-xs font-mono">{edu.startDate} ~ {edu.endDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-slate-600 font-medium">
                    <span>{edu.major} • {edu.degree}</span>
                  </div>
                  {edu.description && (
                    <p className={`text-slate-400 italic ${fontSize === "sm" ? "text-[10px]" : "text-xs"} mt-0.5`}>
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <div id="measure-skills-header" data-block-id="skills-header" className="mt-5">
              {renderSectionTitle("专业技能", <Code />)}
            </div>
            <div id="measure-skills-container" data-block-id="skills-container" className="mt-5">
              <SkillsSectionContent />
            </div>
          </>
        )}
      </div>

      {/* 2. True page-by-page screen and print rendering container */}
      <div id="resume-printable-area" className="flex flex-col gap-6 items-center w-full print:gap-0 print:bg-transparent">
        {Array.from({ length: totalPagesCount }).map((_, i) => (
          <div
            key={i}
            className={`resume-page w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white ${isPrintRoute ? 'border-none shadow-none rounded-none' : 'border border-slate-300/60 shadow-md rounded-xl'} relative overflow-hidden shrink-0 p-12 text-slate-800 text-left print:rounded-none print:shadow-none print:border-none ${fontClasses[fontFamily]}`}
            style={{ color: textColor }}
          >
            {layout === 'one-column' ? (
              <div className="space-y-5">
                {(oneColumnPages[i] || []).map((blockId) => (
                  <div key={blockId} className="space-y-5">
                    {renderBlockById(blockId)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5 h-full flex flex-col justify-between">
                <div>
                  {i === 0 && (
                    <div className="mb-5">
                      <PersonalHeader />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {layout === 'two-column-left' ? (
                      <>
                        <div className="md:col-span-1 border-r border-slate-100/80 pr-4 space-y-5">
                          {(sidebarPages[i] || []).map((blockId) => (
                            <div key={blockId}>{renderBlockById(blockId)}</div>
                          ))}
                        </div>
                        <div className="md:col-span-2 space-y-5">
                          {(mainPages[i] || []).map((blockId) => (
                            <div key={blockId}>{renderBlockById(blockId)}</div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="md:col-span-2 border-r border-slate-100/80 pr-4 space-y-5">
                          {(mainPages[i] || []).map((blockId) => (
                            <div key={blockId}>{renderBlockById(blockId)}</div>
                          ))}
                        </div>
                        <div className="md:col-span-1 pl-1 space-y-5">
                          {(sidebarPages[i] || []).map((blockId) => (
                            <div key={blockId}>{renderBlockById(blockId)}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Page indicator pill at the bottom right - purely for visual preview, hidden during print */}
            {!isPrintRoute && (
              <div className="absolute bottom-4 right-4 bg-slate-100/90 backdrop-blur-xs text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200/60 shadow-2xs select-none no-print print:hidden">
                第 {i + 1} / {totalPagesCount} 页
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
});

export default ResumePreview;
