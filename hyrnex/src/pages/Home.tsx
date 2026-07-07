import React, { useState, useEffect } from 'react';
import { Job, Blog } from '../types';
import { Search, Briefcase, MapPin, Building, Calendar, ArrowRight, ArrowUpRight, CheckCircle2, TrendingUp, Users, Newspaper } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  jobs: Job[];
  blogs: Blog[];
}

export const Home: React.FC<HomeProps> = ({ onNavigate, jobs, blogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Featured and latest jobs lists
    const featured = jobs.filter(j => j.featured && j.status === 'published').slice(0, 3);
    const latest = jobs.filter(j => j.status === 'published').slice(0, 4);
    setFeaturedJobs(featured);
    setLatestJobs(latest);
  }, [jobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('jobs', { search: searchTerm });
  };

  // Popular job categories with icons and count mapping
  const categories = [
    { name: 'Software Engineering', count: jobs.filter(j => j.category === 'Software Engineering').length || 2, color: 'text-blue-600 bg-blue-50' },
    { name: 'Design', count: jobs.filter(j => j.category === 'Design').length || 1, color: 'text-purple-600 bg-purple-50' },
    { name: 'Marketing', count: jobs.filter(j => j.category === 'Marketing').length || 1, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Product Management', count: jobs.filter(j => j.category === 'Product Management').length || 0, color: 'text-orange-600 bg-orange-50' }
  ];

  // Distinct countries listed in jobs
  const countries = Array.from(new Set(jobs.filter(j => j.status === 'published').map(j => j.country))).slice(0, 4);
  if (countries.length === 0) {
    countries.push('United States', 'Remote', 'Canada', 'United Kingdom');
  }

  return (
    <div className="font-sans" id="home-page-container">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-20 border-b border-neutral-100">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Direct-to-Employer Recruitment Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-extrabold text-neutral-900 tracking-tight leading-[1.1] mb-6"
          >
            Your Career <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              Starts Here.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Apply directly to the most innovative tech startups in the industry. No recruitment fees, no middlemen, and absolutely no candidate hassle.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl border border-neutral-200 shadow-lg" id="home-search-form">
              <div className="flex-grow flex items-center gap-2.5 px-3 py-2">
                <Search className="w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm outline-none text-neutral-800 placeholder-neutral-400 bg-transparent"
                  id="home-search-input"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow transition-all duration-150 cursor-pointer"
                id="home-search-button"
              >
                Search Jobs
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 2. Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="bg-white py-16 border-b border-neutral-100" id="home-featured-jobs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Featured Positions</h2>
                <p className="text-sm text-neutral-500 mt-1">High-priority career options at our top companies</p>
              </div>
              <button
                onClick={() => onNavigate('jobs')}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer"
                id="home-view-all-jobs"
              >
                View all jobs
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onNavigate('job-details', { jobId: job.id })}
                  className="bg-white p-6 rounded-2xl border border-neutral-100 card-shadow card-shadow-hover flex flex-col justify-between cursor-pointer"
                  id={`featured-job-${job.id}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold flex items-center justify-center text-lg shadow-sm">
                        {job.logo || job.company[0]}
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                        {job.urgent && (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 line-clamp-1 hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">{job.company}</p>

                    <div className="flex flex-wrap gap-y-1 gap-x-3 mt-4 text-xs text-neutral-500 font-medium">
                      <span className="flex items-center gap-1 text-neutral-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.city || job.country}
                      </span>
                      <span className="flex items-center gap-1 text-neutral-400">
                        <Briefcase className="w-3.5 h-3.5" />
                        {job.employmentType}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-50 mt-6 flex justify-between items-center">
                    <span className="text-xs font-semibold text-neutral-800">{job.salary}</span>
                    <button className="text-xs font-semibold text-neutral-500 group-hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer">
                      View Position
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Latest Jobs List */}
      <section className="bg-[#fafafa] py-16 border-b border-neutral-100" id="home-latest-jobs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Latest Job Postings</h2>
            <p className="text-sm text-neutral-500 mt-1">Direct developer, product, and design roles published recently</p>
          </div>

          <div className="space-y-3">
            {latestJobs.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-neutral-100 shadow-sm text-neutral-500 text-sm">
                No job openings available at the moment. Check back soon!
              </div>
            ) : (
              latestJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onNavigate('job-details', { jobId: job.id })}
                  className="bg-white p-5 rounded-xl border border-neutral-100 card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-neutral-200 transition-all duration-150"
                  id={`latest-job-${job.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-neutral-100 border border-neutral-200/50 font-extrabold flex items-center justify-center text-neutral-700 text-lg">
                      {job.logo || job.company[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">{job.company}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.city}
                        </span>
                        <span>•</span>
                        <span>{job.employmentType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-50">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold text-neutral-800">{job.salary}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Posted {job.publishedDate}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://tally.so/r/PdyPpP', '_blank', 'noopener,noreferrer');
                      }}
                      className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate('jobs')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              id="home-view-all-bottom"
            >
              Explore All Job Opportunities
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Statistics & Why Choose Hyrnex */}
      <section className="bg-white py-20 border-b border-neutral-100" id="home-stats-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">The Hyrnex Difference</h2>
            <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
              Why candidates trust us for direct job submissions over average recruiters and crowded freelance marketplaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-50/50 p-8 rounded-2xl border border-neutral-100 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">100% Direct Application</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Your application goes directly to the hiring administrator. Absolutely no recruiters filtering or hiding your details.
              </p>
            </div>

            <div className="bg-neutral-50/50 p-8 rounded-2xl border border-neutral-100 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 mx-auto flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">No Account Hassles</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                No signups, profiles, or logging in. Simply browse, choose your favorite role, upload your CV, and apply in 60 seconds.
              </p>
            </div>

            <div className="bg-neutral-50/50 p-8 rounded-2xl border border-neutral-100 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Zero Agency Noise</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                We are not a job scraper or agency. Every job on Hyrnex is hand-curated and directly managed by our platform.
              </p>
            </div>
          </div>

          {/* Simple Statistics */}
          <div className="mt-16 pt-16 border-t border-neutral-100 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-extrabold text-neutral-900 tracking-tight">100%</p>
              <p className="text-xs text-neutral-400 font-medium mt-1 uppercase tracking-wider">Direct Access</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-neutral-900 tracking-tight">&lt;2 Min</p>
              <p className="text-xs text-neutral-400 font-medium mt-1 uppercase tracking-wider">Apply Duration</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-neutral-900 tracking-tight">96%</p>
              <p className="text-xs text-neutral-400 font-medium mt-1 uppercase tracking-wider">Delivery Success</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-neutral-900 tracking-tight">Zero</p>
              <p className="text-xs text-neutral-400 font-medium mt-1 uppercase tracking-wider">Scam Listings</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Career Blog Preview */}
      {blogs.length > 0 && (
        <section className="bg-[#fafafa] py-16 border-b border-neutral-100 animate-fade-in" id="home-blog-preview">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">From the Career Blog</h2>
                <p className="text-sm text-neutral-500 mt-1">Insightful articles, resume tips, and interview advice</p>
              </div>
              <button
                onClick={() => onNavigate('blog')}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer"
                id="home-view-all-blog"
              >
                Read all articles
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogs.slice(0, 2).map((blog) => (
                <div
                  key={blog.id}
                  onClick={() => onNavigate('blog-details', { slug: blog.slug })}
                  className="bg-white rounded-2xl border border-neutral-100 card-shadow overflow-hidden group cursor-pointer"
                  id={`home-blog-card-${blog.id}`}
                >
                  <div className="h-48 overflow-hidden bg-neutral-100 relative">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded text-[10px] font-bold text-neutral-700 flex items-center gap-1">
                      <Newspaper className="w-3 h-3" />
                      {blog.readingTime}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <p className="text-[11px] font-medium text-neutral-400">
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <h3 className="text-base font-bold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">
                      {blog.seo}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-1.5 transition-all mt-2 cursor-pointer">
                      Read article <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Newsletter Subscription */}
      <section className="bg-white py-20" id="home-newsletter">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl">
            {/* Ambient visual overlay */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-500 opacity-20 blur-xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-blue-700 opacity-40 blur-xl" />

            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight">Stay updated on new jobs</h2>
              <p className="text-sm text-blue-100 leading-relaxed">
                Join our newsletter list and receive instant notifications whenever a new hand-curated engineering, design, or marketing role is published.
              </p>
              <div className="pt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const emailInput = form.querySelector('input') as HTMLInputElement;
                    if (emailInput.value) {
                      alert(`Thank you for subscribing! We will send updates to ${emailInput.value}`);
                      emailInput.value = '';
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-2 bg-blue-700 p-1.5 rounded-2xl border border-blue-500/50"
                  id="home-newsletter-form"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    className="w-full text-sm outline-none px-4 py-3 placeholder-blue-300 bg-transparent text-white"
                    id="newsletter-email"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-neutral-50 text-sm font-semibold text-blue-600 transition-all cursor-pointer"
                    id="newsletter-submit"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
