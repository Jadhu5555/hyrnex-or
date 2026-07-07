import React, { useMemo } from 'react';
import { Job } from '../types';
import { MapPin, Briefcase, DollarSign, Clock, Users, ArrowLeft, Send, Shield, AlertCircle } from 'lucide-react';

interface JobDetailsProps {
  jobId: string;
  jobs: Job[];
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const JobDetails: React.FC<JobDetailsProps> = ({
  jobId,
  jobs,
  onNavigate
}) => {
  // Find current job
  const job = useMemo(() => jobs.find(j => j.id === jobId), [jobs, jobId]);

  // Find related jobs (same category, excluding current job)
  const relatedJobs = useMemo(() => {
    if (!job) return [];
    return jobs
      .filter(j => j.category === job.category && j.id !== job.id && j.status === 'published')
      .slice(0, 2);
  }, [jobs, job]);

  const handleApplyClick = () => {
    window.open('https://tally.so/r/PdyPpP', '_blank', 'noopener,noreferrer');
  };

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-800">Job Posting Not Found</h2>
        <p className="text-sm text-neutral-500">This role may have been filled, archived, or deleted by the administrator.</p>
        <button
          onClick={() => onNavigate('jobs')}
          className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl cursor-pointer"
        >
          Return to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans relative" id="job-details-page">
      {/* Back to Jobs Link */}
      <button
        onClick={() => onNavigate('jobs')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors mb-8 cursor-pointer"
        id="back-to-jobs-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Careers Portal
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Core Job Details */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
              <div className="flex gap-4 items-center sm:items-start">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200/50 font-extrabold flex items-center justify-center text-neutral-700 text-2xl shadow-sm">
                  {job.logo || job.company[0]}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">{job.title}</h1>
                  <p className="text-sm text-neutral-500 font-semibold mt-0.5">{job.company}</p>
                </div>
              </div>
              <div className="flex gap-1.5 self-start">
                {job.featured && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Featured
                  </span>
                )}
                {job.urgent && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Urgent
                  </span>
                )}
              </div>
            </div>

            {/* Quick Fact Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-50 text-xs font-semibold text-neutral-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <div className="truncate">
                  <p className="text-[10px] text-neutral-400 font-medium">LOCATION</p>
                  <p className="text-neutral-700 truncate">{job.city || job.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">JOB TYPE</p>
                  <p className="text-neutral-700">{job.employmentType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">EXPERIENCE</p>
                  <p className="text-neutral-700">{job.experience}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">SALARY</p>
                  <p className="text-neutral-700">{job.salary}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Rich Body Sections */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-sm space-y-6 text-neutral-700 text-sm leading-relaxed">
            {/* Description */}
            <div className="space-y-2.5">
              <h2 className="text-base font-bold text-neutral-900">Position Overview</h2>
              <p className="whitespace-pre-line text-neutral-600">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="space-y-2.5 pt-4 border-t border-neutral-50">
                <h2 className="text-base font-bold text-neutral-900">Key Responsibilities</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                  {job.responsibilities.split('\n').filter(Boolean).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="space-y-2.5 pt-4 border-t border-neutral-50">
                <h2 className="text-base font-bold text-neutral-900">Requirements & Qualifications</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                  {job.requirements.split('\n').filter(Boolean).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="space-y-2.5 pt-4 border-t border-neutral-50">
                <h2 className="text-base font-bold text-neutral-900">Compensations & Benefits</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                  {job.benefits.split('\n').filter(Boolean).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Quick Actions Sidebar */}
        <div className="col-span-1 space-y-6 sticky top-24">
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800">Interested in this Role?</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Apply in less than 2 minutes directly via our secure application form. No signup or account required.
            </p>

            <button
              onClick={handleApplyClick}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="apply-job-drawer-btn"
            >
              <Send className="w-4 h-4" />
              Apply for this Position
            </button>

            {/* Minor Metadata Facts */}
            <div className="border-t border-neutral-50 pt-4 mt-2 space-y-2.5 text-xs font-semibold text-neutral-500">
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Vacancies</span>
                <span className="text-neutral-800 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  {job.vacancies} {job.vacancies > 1 ? 'Openings' : 'Opening'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Published Date</span>
                <span className="text-neutral-800">{job.publishedDate}</span>
              </div>
              {job.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Apply Before</span>
                  <span className="text-neutral-800">{job.expiryDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Trust Card */}
          <div className="bg-neutral-50 border border-neutral-100 p-5 rounded-2xl space-y-2.5 text-xs">
            <h4 className="font-bold text-neutral-700 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              Hyrnex Candidate Pledge
            </h4>
            <p className="text-neutral-500 leading-relaxed">
              We respect your privacy. All job applications are safely handled through our secure external form on Tally. No personal information or resumes are cached or stored on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Related Jobs Section */}
      {relatedJobs.length > 0 && (
        <section className="mt-16 pt-12 border-t border-neutral-100" id="related-jobs-section">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight mb-6">Similar Open Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedJobs.map(rJob => (
              <div
                key={rJob.id}
                onClick={() => onNavigate('job-details', { jobId: rJob.id })}
                className="bg-white p-5 rounded-xl border border-neutral-100 card-shadow card-shadow-hover flex items-center justify-between gap-4 cursor-pointer"
                id={`related-job-${rJob.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 font-extrabold text-neutral-600 flex items-center justify-center text-sm flex-shrink-0">
                    {rJob.logo || rJob.company[0]}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 hover:text-blue-600 transition-colors line-clamp-1">
                      {rJob.title}
                    </h3>
                    <p className="text-[10px] text-neutral-400">{rJob.company} • {rJob.city || rJob.country}</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  View
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
