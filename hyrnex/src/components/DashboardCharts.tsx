import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Job, Blog } from '../types';
import { Layers, PieChart, Briefcase, TrendingUp, Compass, Award, BookOpen } from 'lucide-react';

interface DashboardChartsProps {
  jobs: Job[];
  blogs: Blog[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  jobs = [],
  blogs = []
}) => {
  // 1. Group Jobs by Category
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      counts[j.category] = (counts[j.category] || 0) + 1;
    });
    return Object.entries(counts).map(([category, count]) => ({
      category,
      count
    })).sort((a, b) => b.count - a.count);
  }, [jobs]);

  // Max count for scaling the SVG chart
  const maxCategoryCount = useMemo(() => {
    return Math.max(...categoryData.map(d => d.count), 1);
  }, [categoryData]);

  const chartHeight = 160;
  const barWidth = 44;
  const barSpacing = 24;
  const chartWidth = Math.max(categoryData.length * (barWidth + barSpacing) + 50, 360);

  // 2. Jobs by Status (Published vs Draft)
  const jobStatusDistribution = useMemo(() => {
    const published = jobs.filter(j => j.status === 'published').length;
    const draft = jobs.filter(j => j.status === 'draft').length;
    const total = jobs.length;

    return { published, draft, total };
  }, [jobs]);

  // 3. Blogs by Status (Published vs Draft)
  const blogStatusDistribution = useMemo(() => {
    const published = blogs.filter(b => b.status === 'published').length;
    const draft = blogs.filter(b => b.status === 'draft').length;
    const total = blogs.length;

    return { published, draft, total };
  }, [blogs]);

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Summary KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Jobs by Category Chart Block */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Jobs by Category
                </h3>
                <p className="text-xs text-neutral-400">Distribution of positions across domains</p>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold">
                Category Breakdown
              </span>
            </div>

            <div className="w-full overflow-x-auto no-scrollbar pt-6 pb-2">
              <div className="flex justify-center">
                {categoryData.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 text-xs">
                    No jobs entered to display category statistics.
                  </div>
                ) : (
                  <svg
                    width={chartWidth}
                    height={chartHeight + 40}
                    viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
                    className="max-w-full"
                  >
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                      const y = chartHeight * (1 - ratio) + 10;
                      return (
                        <g key={idx}>
                          <line
                            x1="30"
                            y1={y}
                            x2={chartWidth - 10}
                            y2={y}
                            stroke="#f3f4f6"
                            className="stroke-neutral-100"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x="20"
                            y={y + 4}
                            fill="#9ca3af"
                            fontSize="10"
                            textAnchor="end"
                            className="font-mono font-medium"
                          >
                            {Math.round(maxCategoryCount * ratio)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars */}
                    {categoryData.map((d, index) => {
                      const barHeight = maxCategoryCount > 0 ? (d.count / maxCategoryCount) * chartHeight : 0;
                      const x = index * (barWidth + barSpacing) + 40;
                      const y = chartHeight - barHeight + 10;

                      return (
                        <g key={d.category} className="group cursor-pointer">
                          <title>{`${d.category}: ${d.count} Jobs`}</title>
                          <defs>
                            <linearGradient id={`barGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
                            </linearGradient>
                          </defs>

                          {/* Bar */}
                          <motion.rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx="5"
                            fill={`url(#barGrad-${index})`}
                            initial={{ scaleY: 0, y: chartHeight + 10 }}
                            animate={{ scaleY: 1, y }}
                            transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                            style={{ transformOrigin: `${x + barWidth / 2}px ${chartHeight + 10}px` }}
                            className="hover:fill-blue-600 transition-colors duration-200"
                          />

                          {/* Label */}
                          <text
                            x={x + barWidth / 2}
                            y={chartHeight + 25}
                            fill="#6b7280"
                            className="font-bold"
                            fontSize="9"
                            textAnchor="middle"
                          >
                            {d.category.length > 8 ? d.category.slice(0, 8) + '...' : d.category}
                          </text>

                          {/* Value above bar */}
                          {d.count > 0 && (
                            <text
                              x={x + barWidth / 2}
                              y={y - 6}
                              fill="#1f2937"
                              fontSize="11"
                              fontWeight="700"
                              textAnchor="middle"
                            >
                              {d.count}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content & Blog Stats Card */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                Portal Content Stats
              </h3>
              <p className="text-xs text-neutral-400">Total jobs and blogs published on Hyrnex</p>
            </div>
            <div className="space-y-5 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-neutral-700">Total Job Openings</span>
                  <span className="font-mono text-neutral-400">{jobs.length}</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${jobs.length > 0 ? 100 : 0}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-neutral-700">Published Blog Articles</span>
                  <span className="font-mono text-neutral-400">{blogs.length}</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${blogs.length > 0 ? 100 : 0}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-50 mt-4 flex justify-between items-center text-[10px] text-neutral-400">
            <span>Dynamic updates active</span>
            <Layers className="w-3.5 h-3.5 text-neutral-300" />
          </div>
        </div>

      </div>

      {/* Visual Status Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Job Status Representation */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Job Status Distribution
              </h3>
              <p className="text-xs text-neutral-400">Published live listings vs saved drafts</p>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs">
                No active job positions entered yet.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="h-4 w-full rounded-full overflow-hidden flex bg-neutral-100">
                  <div
                    style={{ width: `${jobStatusDistribution.total > 0 ? (jobStatusDistribution.published / jobStatusDistribution.total) * 100 : 0}%` }}
                    className="h-full bg-blue-600 hover:brightness-105 transition-all cursor-pointer"
                    title={`Published: ${jobStatusDistribution.published}`}
                  />
                  <div
                    style={{ width: `${jobStatusDistribution.total > 0 ? (jobStatusDistribution.draft / jobStatusDistribution.total) * 100 : 0}%` }}
                    className="h-full bg-amber-500 hover:brightness-105 transition-all cursor-pointer"
                    title={`Drafts: ${jobStatusDistribution.draft}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold">
                  <div className="flex items-center gap-1.5 p-2 bg-neutral-50 rounded-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-neutral-600">Published ({jobStatusDistribution.published})</span>
                    <span className="ml-auto font-mono text-neutral-900">
                      {jobStatusDistribution.total > 0 ? Math.round((jobStatusDistribution.published / jobStatusDistribution.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-neutral-50 rounded-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-neutral-600">Drafts ({jobStatusDistribution.draft})</span>
                    <span className="ml-auto font-mono text-neutral-900">
                      {jobStatusDistribution.total > 0 ? Math.round((jobStatusDistribution.draft / jobStatusDistribution.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Blog Status Representation */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Blog Article Status
              </h3>
              <p className="text-xs text-neutral-400">Live published articles vs draft edits</p>
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs">
                No blog articles entered yet.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="h-4 w-full rounded-full overflow-hidden flex bg-neutral-100">
                  <div
                    style={{ width: `${blogStatusDistribution.total > 0 ? (blogStatusDistribution.published / blogStatusDistribution.total) * 100 : 0}%` }}
                    className="h-full bg-emerald-500 hover:brightness-105 transition-all cursor-pointer"
                    title={`Published: ${blogStatusDistribution.published}`}
                  />
                  <div
                    style={{ width: `${blogStatusDistribution.total > 0 ? (blogStatusDistribution.draft / blogStatusDistribution.total) * 100 : 0}%` }}
                    className="h-full bg-zinc-400 hover:brightness-105 transition-all cursor-pointer"
                    title={`Drafts: ${blogStatusDistribution.draft}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold">
                  <div className="flex items-center gap-1.5 p-2 bg-neutral-50 rounded-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-neutral-600">Published ({blogStatusDistribution.published})</span>
                    <span className="ml-auto font-mono text-neutral-900">
                      {blogStatusDistribution.total > 0 ? Math.round((blogStatusDistribution.published / blogStatusDistribution.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-neutral-50 rounded-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                    <span className="text-neutral-600">Drafts ({blogStatusDistribution.draft})</span>
                    <span className="ml-auto font-mono text-neutral-900">
                      {blogStatusDistribution.total > 0 ? Math.round((blogStatusDistribution.draft / blogStatusDistribution.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
