import React, { useState, useEffect, useMemo } from 'react';
import { Job, Blog, Settings } from '../types';
import { DashboardCharts } from '../components/DashboardCharts';
import { useToast } from '../components/Notification';
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Copy,
  Search,
  Check,
  ShieldAlert,
  Save,
  Lock,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  jobs: Job[];
  blogs: Blog[];
  settings: Settings;
  onRefreshData: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  onLogout,
  onNavigate,
  jobs,
  blogs,
  settings,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'blogs' | 'settings'>('dashboard');
  const { toast } = useToast();

  // Loading indicator for API actions
  const [isActionPending, setIsActionPending] = useState(false);

  // --- SUB-STATES ---
  // Jobs CRUD
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Partial<Job> | null>(null);

  // Blogs CRUD
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Partial<Blog> | null>(null);

  // Search & Filters inside lists
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('');

  const [blogSearch, setBlogSearch] = useState('');

  // Password Change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Settings local state
  const [localSettings, setLocalSettings] = useState<Settings>({ ...settings });

  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  // --- STATS COMPUTATION ---
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'published').length;
    const draftJobs = jobs.filter(j => j.status === 'draft').length;
    const featuredJobs = jobs.filter(j => j.featured).length;
    const totalBlogs = blogs.length;

    return { totalJobs, activeJobs, draftJobs, featuredJobs, totalBlogs };
  }, [jobs, blogs]);

  // --- FILTERED DATA LISTS ---
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchesSearch = j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.category.toLowerCase().includes(jobSearch.toLowerCase());
      const matchesStatus = !jobStatusFilter || j.status === jobStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, jobSearch, jobStatusFilter]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => b.title.toLowerCase().includes(blogSearch.toLowerCase()));
  }, [blogs, blogSearch]);

  // --- JOB OPERATIONS ---
  const handleCreateJobClick = () => {
    setSelectedJob({
      title: '',
      company: '',
      logo: '',
      country: '',
      city: '',
      salary: '',
      experience: 'Senior (5+ years)',
      category: 'Software Engineering',
      employmentType: 'Full-time',
      vacancies: 1,
      description: '',
      responsibilities: '',
      requirements: '',
      benefits: '',
      featured: false,
      urgent: false,
      expiryDate: '',
      status: 'draft'
    });
    setIsEditingJob(true);
  };

  const handleEditJobClick = (job: Job) => {
    setSelectedJob({ ...job });
    setIsEditingJob(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !selectedJob.title || !selectedJob.company) {
      toast('Title and Company are required fields', 'error');
      return;
    }

    setIsActionPending(true);
    const isNew = !selectedJob.id;
    const url = isNew ? '/api/jobs' : `/api/jobs/${selectedJob.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedJob)
      });

      if (response.ok) {
        toast(`Job post ${isNew ? 'created' : 'updated'} successfully!`, 'success');
        setIsEditingJob(false);
        setSelectedJob(null);
        await onRefreshData();
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to save job post', 'error');
      }
    } catch (err) {
      toast('Network error saving job post', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you absolute sure you want to delete this job opening? All associated applications will lose references.')) return;
    setIsActionPending(true);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast('Job post permanently deleted.', 'success');
        await onRefreshData();
      } else {
        toast('Failed to delete job post', 'error');
      }
    } catch (err) {
      toast('Network error deleting job', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleDuplicateJob = async (id: string) => {
    setIsActionPending(true);
    try {
      const response = await fetch(`/api/jobs/duplicate/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast('Job duplicated successfully as a new draft!', 'success');
        await onRefreshData();
      } else {
        toast('Failed to duplicate job post', 'error');
      }
    } catch (err) {
      toast('Network error duplicating job', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleToggleJobStatus = async (job: Job, newStatus: Job['status']) => {
    setIsActionPending(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        toast(`Job status updated to ${newStatus}!`, 'success');
        await onRefreshData();
      } else {
        toast('Failed to change job status', 'error');
      }
    } catch (err) {
      toast('Network error changing job status', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

// --- BLOG OPERATIONS ---
  const handleCreateBlogClick = () => {
    setSelectedBlog({
      title: '',
      slug: '',
      content: '',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800',
      seo: '',
      readingTime: '5 min read',
      draft: true
    });
    setIsEditingBlog(true);
  };

  const handleEditBlogClick = (blog: Blog) => {
    setSelectedBlog({ ...blog });
    setIsEditingBlog(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlog || !selectedBlog.title || !selectedBlog.slug) {
      toast('Title and Slug are required fields', 'error');
      return;
    }

    setIsActionPending(true);
    const isNew = !selectedBlog.id;
    const url = isNew ? '/api/blogs' : `/api/blogs/${selectedBlog.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedBlog)
      });

      if (response.ok) {
        toast(`Blog post ${isNew ? 'created' : 'updated'} successfully!`, 'success');
        setIsEditingBlog(false);
        setSelectedBlog(null);
        await onRefreshData();
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to save blog post', 'error');
      }
    } catch (err) {
      toast('Network error saving blog', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you absolute sure you want to permanently delete this career blog article?')) return;
    setIsActionPending(true);
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast('Blog article permanently deleted.', 'success');
        await onRefreshData();
      } else {
        toast('Failed to delete blog article', 'error');
      }
    } catch (err) {
      toast('Network error deleting blog', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  // --- SETTINGS OPERATIONS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionPending(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(localSettings)
      });
      if (response.ok) {
        toast('System settings updated successfully!', 'success');
        await onRefreshData();
      } else {
        toast('Failed to update system settings', 'error');
      }
    } catch (err) {
      toast('Network error saving settings', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }

    setIsActionPending(true);
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      if (response.ok) {
        toast('Administrator security password updated successfully!', 'success');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to update password', 'error');
      }
    } catch (err) {
      toast('Network error updating password', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans flex flex-col md:flex-row gap-8 items-start relative" id="admin-dashboard-container">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <div className="w-full md:w-64 bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-6 flex-shrink-0">
        <div className="pb-3 border-b border-neutral-100">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Signed In Administrator</p>
          <p className="text-sm font-bold text-neutral-800 truncate mt-0.5">{settings.siteName} Console</p>
        </div>

        <ul className="space-y-1.5 text-xs font-semibold text-neutral-600">
          <li>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-neutral-50 hover:text-neutral-950'
              }`}
              id="tab-dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview Console
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'jobs' ? 'bg-blue-50 text-blue-600' : 'hover:bg-neutral-50 hover:text-neutral-950'
              }`}
              id="tab-jobs"
            >
              <Briefcase className="w-4 h-4" />
              Manage Job Posts
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'blogs' ? 'bg-blue-50 text-blue-600' : 'hover:bg-neutral-50 hover:text-neutral-950'
              }`}
              id="tab-blogs"
            >
              <BookOpen className="w-4 h-4" />
              Manage Career Blog
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'hover:bg-neutral-50 hover:text-neutral-950'
              }`}
              id="tab-settings"
            >
              <SettingsIcon className="w-4 h-4" />
              System Settings
            </button>
          </li>
          <li className="pt-4 border-t border-neutral-100">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50/50 transition-all cursor-pointer"
              id="tab-logout"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Console
            </button>
          </li>
        </ul>
      </div>

      {/* 2. MAIN ACTIVE VIEW PORT */}
      <div className="flex-grow w-full space-y-6">

        {/* ==================== TAB: OVERVIEW DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in" id="dashboard-overview-tab">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-1">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase">Total Job Posts</p>
                <p className="text-2xl font-extrabold text-neutral-900">{stats.totalJobs}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-1">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase">Active Published</p>
                <p className="text-2xl font-extrabold text-neutral-900">{stats.activeJobs}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-1">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase">Career Blogs</p>
                <p className="text-2xl font-extrabold text-neutral-900">{stats.totalBlogs}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-1">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase">Featured Roles</p>
                <p className="text-2xl font-extrabold text-blue-600">{stats.featuredJobs}</p>
              </div>
            </div>

            {/* Dashboard SVG Charts */}
            <DashboardCharts
              jobs={jobs}
              blogs={blogs}
            />
          </div>
        )}

        {/* ==================== TAB: JOBS MANAGEMENT ==================== */}
        {activeTab === 'jobs' && (
          <div className="space-y-6 animate-fade-in" id="jobs-management-tab">
            
            {/* Sub-view: Jobs Form (Create/Edit) */}
            {isEditingJob && selectedJob ? (
              <form onSubmit={handleSaveJob} className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800">
                      {selectedJob.id ? 'Edit Job Opening' : 'Publish New Job Posting'}
                    </h3>
                    <p className="text-[10px] text-neutral-400">Configure core facts and rich content</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setIsEditingJob(false); setSelectedJob(null); }}
                    className="text-xs font-semibold text-neutral-500 hover:text-neutral-800"
                  >
                    Cancel Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Job Title <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={selectedJob.title || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, title: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="Senior Full Stack Engineer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Company Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={selectedJob.company || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, company: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="Stripe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Company Logo Symbol/URL</label>
                    <input
                      type="text"
                      value={selectedJob.logo || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, logo: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="S"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Category</label>
                    <input
                      type="text"
                      value={selectedJob.category || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, category: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="Software Engineering"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Employment Type</label>
                    <input
                      type="text"
                      value={selectedJob.employmentType || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, employmentType: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="Full-time"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Experience Requirement</label>
                    <input
                      type="text"
                      value={selectedJob.experience || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, experience: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="Senior (5+ years)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Salary Range</label>
                    <input
                      type="text"
                      value={selectedJob.salary || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, salary: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="$150,000 - $180,000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Country</label>
                      <input
                        type="text"
                        value={selectedJob.country || ''}
                        onChange={(e) => setSelectedJob({ ...selectedJob, country: e.target.value })}
                        className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                        placeholder="United States"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">City</label>
                      <input
                        type="text"
                        value={selectedJob.city || ''}
                        onChange={(e) => setSelectedJob({ ...selectedJob, city: e.target.value })}
                        className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                        placeholder="San Francisco"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Total Vacancies</label>
                    <input
                      type="number"
                      value={selectedJob.vacancies || 1}
                      onChange={(e) => setSelectedJob({ ...selectedJob, vacancies: parseInt(e.target.value) || 1 })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Expiry Date</label>
                    <input
                      type="date"
                      value={selectedJob.expiryDate || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, expiryDate: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Textarea fields */}
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Job Description</label>
                    <textarea
                      value={selectedJob.description || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, description: e.target.value })}
                      rows={5}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 resize-y"
                      placeholder="Detail position duties..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Responsibilities (One per line)</label>
                    <textarea
                      value={selectedJob.responsibilities || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, responsibilities: e.target.value })}
                      rows={4}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 resize-y"
                      placeholder="Write robust APIs and services&#10;Optimize database indexes"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Requirements (One per line)</label>
                    <textarea
                      value={selectedJob.requirements || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, requirements: e.target.value })}
                      rows={4}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 resize-y"
                      placeholder="5+ years of production experience&#10;B.S. in Computer Science"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Benefits (One per line)</label>
                    <textarea
                      value={selectedJob.benefits || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, benefits: e.target.value })}
                      rows={4}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 resize-y"
                      placeholder="Unlimited PTO&#10;Premium workspace allowance"
                    />
                  </div>
                </div>

                {/* Checkboxes & Status */}
                <div className="pt-4 border-t border-neutral-100 flex flex-wrap gap-6 text-xs font-semibold text-neutral-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedJob.featured || false}
                      onChange={(e) => setSelectedJob({ ...selectedJob, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-neutral-300 text-blue-600"
                    />
                    Featured Post
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedJob.urgent || false}
                      onChange={(e) => setSelectedJob({ ...selectedJob, urgent: e.target.checked })}
                      className="w-4 h-4 rounded border-neutral-300 text-blue-600"
                    />
                    Urgent Opening
                  </label>
                  <div className="flex items-center gap-2 ml-auto">
                    <span>Publish Status:</span>
                    <select
                      value={selectedJob.status || 'draft'}
                      onChange={(e) => setSelectedJob({ ...selectedJob, status: e.target.value as any })}
                      className="border border-neutral-200 rounded px-2 py-1 bg-neutral-50 outline-none"
                    >
                      <option value="draft">Draft (Private)</option>
                      <option value="published">Published (Public)</option>
                      <option value="closed">Closed (Expired)</option>
                      <option value="archived">Archived (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-6 border-t border-neutral-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsEditingJob(false); setSelectedJob(null); }}
                    className="px-5 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionPending}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    Save Job Posting
                  </button>
                </div>
              </form>
            ) : (
              /* Sub-view: Jobs list layout */
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800">Job Management List</h3>
                    <p className="text-[10px] text-neutral-400">Total: {jobs.length} postings</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex items-center border border-neutral-200 rounded-xl px-2.5 py-1.5 bg-[#fafafa]">
                      <Search className="w-4 h-4 text-neutral-400 mr-2" />
                      <input
                        type="text"
                        placeholder="Search title, company..."
                        value={jobSearch}
                        onChange={(e) => setJobSearch(e.target.value)}
                        className="text-xs bg-transparent outline-none text-neutral-800"
                      />
                    </div>
                    <button
                      onClick={handleCreateJobClick}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Job
                    </button>
                  </div>
                </div>

                {/* Jobs Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Job Title</th>
                        <th className="py-3 px-2">Company</th>
                        <th className="py-3 px-2">Location</th>
                        <th className="py-3 px-2">Salary</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-neutral-700">
                      {filteredJobs.map(job => (
                        <tr key={job.id} className="hover:bg-neutral-50/30 transition-colors">
                          <td className="py-3 px-2 font-bold text-neutral-900">{job.title}</td>
                          <td className="py-3 px-2">{job.company}</td>
                          <td className="py-3 px-2 text-neutral-500">{job.city || job.country}</td>
                          <td className="py-3 px-2 text-neutral-500">{job.salary}</td>
                          <td className="py-3 px-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              job.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              job.status === 'draft' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-neutral-100 text-neutral-600'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEditJobClick(job)}
                              className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-800 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateJob(job.id)}
                              className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-800 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1 hover:bg-neutral-100 rounded text-rose-500 hover:text-rose-700 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredJobs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-neutral-400">
                            No job openings found matching filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

{/* ==================== TAB: BLOGS CRUD ==================== */}
        {activeTab === 'blogs' && (
          <div className="space-y-6 animate-fade-in" id="blogs-tab">
            {isEditingBlog && selectedBlog ? (
              <form onSubmit={handleSaveBlog} className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800">
                      {selectedBlog.id ? 'Edit Blog Article' : 'Publish New Blog Article'}
                    </h3>
                    <p className="text-[10px] text-neutral-400">Write high-engagement guides and career articles</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setIsEditingBlog(false); setSelectedBlog(null); }}
                    className="text-xs font-semibold text-neutral-500 hover:text-neutral-800"
                  >
                    Cancel Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-600">Blog Title <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={selectedBlog.title || ''}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setSelectedBlog({ ...selectedBlog, title, slug });
                      }}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="How to Build a Standout Software Engineering Portfolio in 2026"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">URL Slug <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={selectedBlog.slug || ''}
                      onChange={(e) => setSelectedBlog({ ...selectedBlog, slug: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="build-standout-engineering-portfolio-2026"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Reading Duration (e.g. '5 min read')</label>
                    <input
                      type="text"
                      value={selectedBlog.readingTime || ''}
                      onChange={(e) => setSelectedBlog({ ...selectedBlog, readingTime: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="5 min read"
                    />
                  </div>
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-600">Hero Image Unsplash/Web URL</label>
                    <input
                      type="url"
                      value={selectedBlog.image || ''}
                      onChange={(e) => setSelectedBlog({ ...selectedBlog, image: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-600">SEO Meta Description</label>
                    <input
                      type="text"
                      value={selectedBlog.seo || ''}
                      onChange={(e) => setSelectedBlog({ ...selectedBlog, seo: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                      placeholder="Brief 150-char hook for previews..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Article Content (Plain text or Markdown-like)</label>
                  <textarea
                    value={selectedBlog.content || ''}
                    onChange={(e) => setSelectedBlog({ ...selectedBlog, content: e.target.value })}
                    rows={12}
                    className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 font-mono resize-y"
                    placeholder="Write article details here..."
                  />
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedBlog.draft || false}
                      onChange={(e) => setSelectedBlog({ ...selectedBlog, draft: e.target.checked })}
                      className="w-4 h-4 rounded border-neutral-300 text-blue-600"
                    />
                    Keep as Private Draft
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsEditingBlog(false); setSelectedBlog(null); }}
                      className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isActionPending}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      Save Article
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Blogs listing */
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800">Career Blogs CRUD</h3>
                    <p className="text-[10px] text-neutral-400">Direct insights and guides</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex items-center border border-neutral-200 rounded-xl px-2.5 py-1.5 bg-[#fafafa]">
                      <Search className="w-4 h-4 text-neutral-400 mr-2" />
                      <input
                        type="text"
                        placeholder="Search blogs..."
                        value={blogSearch}
                        onChange={(e) => setBlogSearch(e.target.value)}
                        className="text-xs bg-transparent outline-none text-neutral-800"
                      />
                    </div>
                    <button
                      onClick={handleCreateBlogClick}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Article
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Article Title</th>
                        <th className="py-3 px-2">Reading Time</th>
                        <th className="py-3 px-2">Draft Mode</th>
                        <th className="py-3 px-2">Date Created</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-neutral-700">
                      {filteredBlogs.map(blog => (
                        <tr key={blog.id} className="hover:bg-neutral-50/30 transition-colors">
                          <td className="py-3 px-2 font-bold text-neutral-900">{blog.title}</td>
                          <td className="py-3 px-2 text-neutral-500">{blog.readingTime}</td>
                          <td className="py-3 px-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              blog.draft ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {blog.draft ? 'DRAFT' : 'LIVE'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-neutral-400">
                            {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-2 text-right flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEditBlogClick(blog)}
                              className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-800 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="p-1 hover:bg-neutral-100 rounded text-rose-500 hover:text-rose-700 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredBlogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-neutral-400">
                            No articles found matching filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: SYSTEM SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" id="settings-tab">
            
            {/* Left: General Info & Cloudinary Settings */}
            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-bold text-neutral-800">General Platform Settings</h3>
                <p className="text-[10px] text-neutral-400">Adjust contact details, site title, and Cloudinary keys</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Platform Title Name</label>
                  <input
                    type="text"
                    required
                    value={localSettings.siteName || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                    className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={localSettings.contactEmail || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                    className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={localSettings.contactPhone || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
                    className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Headquarters Address</label>
                  <input
                    type="text"
                    required
                    value={localSettings.address || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                    className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Cloudinary Integration settings */}
                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  <h4 className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Cloudinary API Storage Settings
                  </h4>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Cloudinary Cloud Name</label>
                    <input
                      type="text"
                      value={localSettings.cloudinaryCloudName || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, cloudinaryCloudName: e.target.value })}
                      placeholder="Leave empty for local upload fallback"
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Cloudinary Upload Preset</label>
                    <input
                      type="text"
                      value={localSettings.cloudinaryUploadPreset || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, cloudinaryUploadPreset: e.target.value })}
                      placeholder="e.g. hyrnex_preset"
                      className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <button
                  type="submit"
                  disabled={isActionPending}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow"
                >
                  Save Platform Settings
                </button>
              </div>
            </form>

            {/* Right: Security & Credentials Management */}
            <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4 h-fit">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-bold text-neutral-800">Admin Password Configuration</h3>
                <p className="text-[10px] text-neutral-400">Change administrator access credentials</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">New Password</label>
                  <div className="relative flex items-center border border-neutral-200 rounded-xl px-3 py-2.5 bg-[#fafafa]">
                    <Lock className="w-4 h-4 text-neutral-400 mr-2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full text-xs bg-transparent outline-none text-neutral-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Confirm Password</label>
                  <div className="relative flex items-center border border-neutral-200 rounded-xl px-3 py-2.5 bg-[#fafafa]">
                    <Lock className="w-4 h-4 text-neutral-400 mr-2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full text-xs bg-transparent outline-none text-neutral-800"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <button
                  type="submit"
                  disabled={isActionPending}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white shadow"
                >
                  Change Admin Password
                </button>
              </div>
            </form>
          </div>
        )}

      </div>



    </div>
  );
};
