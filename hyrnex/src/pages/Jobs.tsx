import React, { useState, useEffect, useMemo } from 'react';
import { Job } from '../types';
import { Search, MapPin, Briefcase, DollarSign, Clock, Filter, RotateCcw, AlertCircle, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JobsProps {
  jobs: Job[];
  onNavigate: (page: string, params?: Record<string, any>) => void;
  initialSearch?: string;
}

export const Jobs: React.FC<JobsProps> = ({ jobs, onNavigate, initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // Sync initialSearch if it changes from navigation
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  // Extract unique filter options from database
  const filterOptions = useMemo(() => {
    const publishedJobs = jobs.filter(j => j.status === 'published');
    
    const countries = Array.from(new Set(publishedJobs.map(j => j.country))).filter(Boolean);
    const categories = Array.from(new Set(publishedJobs.map(j => j.category))).filter(Boolean);
    const experiences = Array.from(new Set(publishedJobs.map(j => j.experience))).filter(Boolean);
    const types = Array.from(new Set(publishedJobs.map(j => j.employmentType))).filter(Boolean);

    return { countries, categories, experiences, types };
  }, [jobs]);

  // Filter and search logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Check status (only show published ones to public)
      if (job.status !== 'published') return false;

      // Search matching (title, company, description, category, country, city)
      const matchesSearch = searchTerm.trim() === '' || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.country.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = selectedCountry === '' || job.country === selectedCountry;
      const matchesCategory = selectedCategory === '' || job.category === selectedCategory;
      const matchesExperience = selectedExperience === '' || job.experience === selectedExperience;
      const matchesType = selectedType === '' || job.employmentType === selectedType;
      const matchesFeatured = !showFeaturedOnly || job.featured;
      const matchesUrgent = !showUrgentOnly || job.urgent;

      return matchesSearch && matchesCountry && matchesCategory && matchesExperience && matchesType && matchesFeatured && matchesUrgent;
    });
  }, [jobs, searchTerm, selectedCountry, selectedCategory, selectedExperience, selectedType, showFeaturedOnly, showUrgentOnly]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedCategory('');
    setSelectedExperience('');
    setSelectedType('');
    setShowFeaturedOnly(false);
    setShowUrgentOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans" id="jobs-page">
      {/* Page Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Browse Open Career Positions</h1>
        <p className="text-sm text-neutral-500 mt-1.5">Direct submissions. Clean processes. Premium startups only.</p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Panel (Desktop Sidebar / Mobile collapse) */}
        <div className="col-span-1 space-y-6 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              Filter Jobs
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
              id="reset-filters-btn"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>

          {/* Search Input Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Search</label>
            <div className="relative flex items-center border border-neutral-200 rounded-xl px-3 py-2 bg-[#fafafa]">
              <Search className="w-4 h-4 text-neutral-400 mr-2" />
              <input
                type="text"
                placeholder="Title, company, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-transparent outline-none text-neutral-800"
                id="jobs-search-input"
              />
            </div>
          </div>

          {/* Country Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 bg-[#fafafa] outline-none text-neutral-700 cursor-pointer"
              id="filter-country"
            >
              <option value="">All Countries</option>
              {filterOptions.countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 bg-[#fafafa] outline-none text-neutral-700 cursor-pointer"
              id="filter-category"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Experience</label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 bg-[#fafafa] outline-none text-neutral-700 cursor-pointer"
              id="filter-experience"
            >
              <option value="">All Experience Levels</option>
              {filterOptions.experiences.map(eOption => (
                <option key={eOption} value={eOption}>{eOption}</option>
              ))}
            </select>
          </div>

          {/* Employment Type Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Employment Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 bg-[#fafafa] outline-none text-neutral-700 cursor-pointer"
              id="filter-employment-type"
            >
              <option value="">All Types</option>
              {filterOptions.types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Checkboxes (Featured & Urgent) */}
          <div className="pt-4 border-t border-neutral-100 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-600 select-none">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                id="checkbox-featured"
              />
              Featured Positions
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-600 select-none">
              <input
                type="checkbox"
                checked={showUrgentOnly}
                onChange={(e) => setShowUrgentOnly(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                id="checkbox-urgent"
              />
              Urgent Openings
            </label>
          </div>
        </div>

        {/* Jobs Grid (3/4 column) */}
        <div className="col-span-1 lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center text-xs text-neutral-400 font-medium px-1">
            <span>Showing <strong className="text-neutral-700">{filteredJobs.length}</strong> matching roles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="col-span-1 md:col-span-2 bg-white p-12 rounded-2xl border border-neutral-100 shadow-sm text-center flex flex-col items-center gap-3"
                  id="no-jobs-found-message"
                >
                  <AlertCircle className="w-8 h-8 text-neutral-400" />
                  <h3 className="text-base font-bold text-neutral-800">No jobs match your criteria</h3>
                  <p className="text-sm text-neutral-500 max-w-sm">
                    Try loosening your filters, removing keywords, or resetting options to see our other open vacancies.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </motion.div>
              ) : (
                filteredJobs.map((job) => (
                  <motion.div
                    layout
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onNavigate('job-details', { jobId: job.id })}
                    className="bg-white p-6 rounded-2xl border border-neutral-100 card-shadow card-shadow-hover flex flex-col justify-between cursor-pointer"
                    id={`job-card-${job.id}`}
                  >
                    <div>
                      {/* Company Info Header */}
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-neutral-100 border border-neutral-200/50 font-extrabold flex items-center justify-center text-neutral-700 text-lg">
                          {job.logo || job.company[0]}
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {job.featured && (
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase">
                              Featured
                            </span>
                          )}
                          {job.urgent && (
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase">
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Job Info */}
                      <h3 className="text-base font-bold text-neutral-900 line-clamp-1 hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-neutral-500 font-semibold mt-0.5">{job.company}</p>

                      {/* Meta Tags */}
                      <div className="grid grid-cols-2 gap-y-2 mt-4 text-xs font-semibold text-neutral-600">
                        <span className="flex items-center gap-1.5 text-neutral-500 truncate">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          {job.city || job.country}
                        </span>
                        <span className="flex items-center gap-1.5 text-neutral-500 truncate">
                          <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                          {job.employmentType}
                        </span>
                        <span className="flex items-center gap-1.5 text-neutral-500 truncate">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {job.experience}
                        </span>
                        <span className="flex items-center gap-1.5 text-neutral-500 truncate">
                          <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                          {job.salary}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-4 border-t border-neutral-50 mt-6 flex justify-between items-center">
                      <span className="text-[10px] text-neutral-400 font-medium">
                        Posted {new Date(job.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open('https://tally.so/r/PdyPpP', '_blank', 'noopener,noreferrer');
                        }}
                        className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                      >
                        Apply Now
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
