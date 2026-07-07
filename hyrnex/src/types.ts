export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string; // URL or placeholder character
  country: string;
  city: string;
  salary: string; // e.g. "$120,000 - $150,000"
  experience: string; // e.g. "Senior (5+ years)"
  category: string; // e.g. "Software Engineering"
  employmentType: string; // Full-time, Part-time, Contract, Internship, Remote
  vacancies: number;
  description: string;
  responsibilities: string; // Newline separated or text
  requirements: string; // Newline separated or text
  benefits: string; // Newline separated or text
  featured: boolean;
  urgent: boolean;
  publishedDate: string;
  expiryDate: string;
  status: 'published' | 'draft' | 'archived' | 'closed';
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details?: string;
}

export interface AiAnalysis {
  parsedResume?: {
    education: string[];
    experienceSummary: string;
    skills: string[];
  };
  skillExtraction: string[];
  candidateSummary: string;
  jobMatchScore: number;
  missingSkills: string[];
  strongSkills: string[];
  analyzedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle?: string; // Denormalized for display convenience
  jobCompany?: string; // Denormalized for display convenience
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  highestEducation: string;
  experience: string; // e.g. "3 years"
  skills: string; // Comma-separated or text
  currentCompany: string;
  currentSalary: string;
  expectedSalary: string;
  noticePeriod: string;
  linkedIn: string;
  portfolio: string;
  coverLetter: string;
  resumeUrl: string;
  resumeName: string;
  status: 'Applied' | 'Screening' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected' | 'Joined';
  notes: string;
  createdAt: string;
  aiAnalysis?: AiAnalysis;
  activityLog?: ActivityLog[];
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string; // Image URL
  seo: string; // SEO meta description
  readingTime: string; // e.g. "5 min read"
  draft: boolean;
  createdAt: string;
}

export interface Settings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
}
