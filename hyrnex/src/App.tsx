import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { Job, Blog, Settings } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastProvider, useToast } from './components/Notification';
import { Home } from './pages/Home';
import { Jobs } from './pages/Jobs';
import { JobDetails } from './pages/JobDetails';
import { About } from './pages/About';
import { CareerBlog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { PrivacyTerms } from './pages/PrivacyTerms';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { ShieldAlert, AlertCircle } from 'lucide-react';

const DEFAULT_SETTINGS: Settings = {
  siteName: 'Hyrnex',
  contactEmail: 'hello@hyrnex.com',
  contactPhone: '+1 (555) 019-2834',
  address: '100 Pine Street, San Francisco, CA 94111',
  linkedinUrl: 'https://linkedin.com/company/hyrnex',
  githubUrl: 'https://github.com/hyrnex',
  twitterUrl: 'https://twitter.com/hyrnex',
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: ''
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Core Platform Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Auth State
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('hyrnex_admin_token'));
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);

  const { toast } = useToast();

  // --- CORE DATA FETCHERS ---
  const fetchAllData = useCallback(async () => {
    try {
      // 1. Fetch public settings
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(prev => ({ ...prev, ...settingsData }));
      }

      // 2. Fetch jobs list (attaches auth header if admin)
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      const jobsRes = await fetch('/api/jobs', { headers });
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }

      // 3. Fetch blogs list
      const blogsRes = await fetch('/api/blogs', { headers });
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(blogsData);
      }

      // Fetch admin-level settings with Cloudinary details
      if (adminToken) {
        const adminSettingsRes = await fetch('/api/admin/settings', { headers });
        if (adminSettingsRes.ok) {
          const adminSettingsData = await adminSettingsRes.json();
          setSettings(adminSettingsData);
        }
      }
    } catch (err) {
      console.error('Error fetching platform data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adminToken]);

  // Handle validating existing administrative token on launch
  useEffect(() => {
    async function validateSession() {
      if (!adminToken) {
        await fetchAllData();
        return;
      }

      try {
        const res = await fetch('/api/admin/me', {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAdminUser({ email: data.admin.email, name: data.admin.name });
        } else {
          // Token expired or invalid
          localStorage.removeItem('hyrnex_admin_token');
          setAdminToken(null);
          setAdminUser(null);
        }
      } catch (err) {
        console.error('Session validation error:', err);
      } finally {
        await fetchAllData();
      }
    }

    validateSession();
  }, [adminToken, fetchAllData]);

  // --- ACTIONS ---
  const handleNavigate = useCallback((page: string, params: Record<string, any> = {}) => {
    if (page === 'home') {
      navigate('/');
    } else if (page === 'jobs') {
      if (params.search) {
        navigate(`/jobs?search=${encodeURIComponent(params.search)}`);
      } else {
        navigate('/jobs');
      }
    } else if (page === 'job-details') {
      navigate(`/jobs/${params.jobId || ''}`);
    } else if (page === 'about') {
      navigate('/about');
    } else if (page === 'blog') {
      if (params.slug) {
        navigate(`/blog/${params.slug}`);
      } else {
        navigate('/blog');
      }
    } else if (page === 'blog-details') {
      navigate(`/blog/${params.slug || ''}`);
    } else if (page === 'contact') {
      navigate('/contact');
    } else if (page === 'privacy') {
      navigate('/privacy');
    } else if (page === 'terms') {
      navigate('/terms');
    } else if (page === 'admin-login') {
      navigate('/admin');
    } else if (page === 'admin-dashboard') {
      navigate('/admin-dashboard');
    }
    window.scrollTo({ top: 0 });
  }, [navigate]);

  const handleLoginSuccess = (token: string, user: { email: string; name: string }) => {
    localStorage.setItem('hyrnex_admin_token', token);
    setAdminToken(token);
    setAdminUser(user);
    navigate('/admin-dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
    } catch (err) {
      console.error('Error during logout api request:', err);
    }

    localStorage.removeItem('hyrnex_admin_token');
    setAdminToken(null);
    setAdminUser(null);
    toast('Logged out successfully.', 'info');
    navigate('/');
  };

  // Route wrapper components
  const JobsRoute = () => {
    const [searchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    return <Jobs jobs={jobs} onNavigate={handleNavigate} initialSearch={search} />;
  };

  const JobDetailsRoute = () => {
    const { id } = useParams();
    return <JobDetails jobId={id || ''} jobs={jobs} onNavigate={handleNavigate} />;
  };

  const BlogRoute = () => {
    return <CareerBlog blogs={blogs} onNavigate={handleNavigate} selectedSlug="" />;
  };

  const BlogDetailsRoute = () => {
    const { slug } = useParams();
    return <CareerBlog blogs={blogs} onNavigate={handleNavigate} selectedSlug={slug || ''} />;
  };

  // Global Loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4 font-sans">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-bold text-neutral-500 tracking-wider uppercase animate-pulse">
          Starting Hyrnex Careers Portal...
        </p>
      </div>
    );
  }

  const getMappedPageName = (pathname: string) => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/jobs')) return 'jobs';
    if (pathname === '/about') return 'about';
    if (pathname.startsWith('/blog')) return 'blog';
    if (pathname === '/contact') return 'contact';
    if (pathname === '/privacy') return 'privacy';
    if (pathname === '/terms') return 'terms';
    if (pathname === '/admin') return 'admin-login';
    if (pathname === '/admin-dashboard') return 'admin-dashboard';
    return '';
  };

  const currentMappedPage = getMappedPageName(location.pathname);
  const isDashboard = location.pathname === '/admin-dashboard';

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Conditionally render public header navbar */}
      {!isDashboard && (
        <Navbar
          currentPage={currentMappedPage}
          onNavigate={handleNavigate}
          isAdminLoggedIn={!!adminToken}
          onLogout={handleLogout}
        />
      )}

      {/* Primary Page viewport */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onNavigate={handleNavigate} jobs={jobs} blogs={blogs} />} />
          <Route path="/jobs" element={<JobsRoute />} />
          <Route path="/jobs/:id" element={<JobDetailsRoute />} />
          <Route path="/about" element={<About onNavigate={handleNavigate} />} />
          <Route path="/blog" element={<BlogRoute />} />
          <Route path="/blog/:slug" element={<BlogDetailsRoute />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyTerms view="privacy" />} />
          <Route path="/terms" element={<PrivacyTerms view="terms" />} />
          <Route 
            path="/admin" 
            element={
              adminToken ? (
                <Navigate to="/admin-dashboard" replace />
              ) : (
                <AdminLogin onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
              )
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              adminToken ? (
                <AdminDashboard
                  token={adminToken}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                  jobs={jobs}
                  blogs={blogs}
                  settings={settings}
                  onRefreshData={fetchAllData}
                />
              ) : (
                <Navigate to="/admin" replace />
              )
            } 
          />
          <Route 
            path="*" 
            element={
              <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto animate-bounce" />
                <h2 className="text-xl font-bold text-neutral-800">404 - Page Not Found</h2>
                <p className="text-sm text-neutral-500">The career page you are seeking does not exist or was shifted.</p>
                <button
                  onClick={() => handleNavigate('home')}
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl cursor-pointer"
                >
                  Return Home
                </button>
              </div>
            } 
          />
        </Routes>
      </main>

      {/* Conditionally render public footer */}
      {!isDashboard && (
        <Footer
          onNavigate={handleNavigate}
          siteName={settings.siteName}
          email={settings.contactEmail}
          phone={settings.contactPhone}
          address={settings.address}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  );
}
