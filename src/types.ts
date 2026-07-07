export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  avatar: string; // Base64 or URL
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  skills: string[];
  summary: string;
}

export type TemplateType = 'classic' | 'modern' | 'minimalist' | 'creative' | 'editorial';

export interface ResumeStyles {
  template: TemplateType;
  primaryColor: string;
  textColor: string;
  fontSize: 'sm' | 'base' | 'lg';
  fontFamily: 'sans' | 'serif' | 'mono';
  spacing: 'compact' | 'normal' | 'relaxed';
  layout: 'one-column' | 'two-column-left' | 'two-column-right';
  showAvatar: boolean;
}

export interface OptimizeSuggestion {
  original: string;
  suggested: string;
  explanation: string;
}

export interface ResumeOptimizationResponse {
  personalInfo: {
    title: string;
  };
  summary: {
    original: string;
    suggested: string;
    explanation: string;
  };
  experiences: {
    id: string;
    company: string;
    position: string;
    original: string;
    suggested: string;
    explanation: string;
  }[];
  projects: {
    id: string;
    name: string;
    role: string;
    original: string;
    suggested: string;
    explanation: string;
  }[];
  skills: {
    added: string[];
    removed: string[];
  };
}
