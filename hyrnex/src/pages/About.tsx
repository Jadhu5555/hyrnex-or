import React from 'react';
import { Target, Users2, ShieldCheck, Heart, Sparkles, Building, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutProps {
  onNavigate: (page: string) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-sans space-y-16" id="about-page">
      {/* 1. Header Hero */}
      <div className="text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
          Our Philosophy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
          Recruitment, Reimagined for the Startup Era.
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Hyrnex was built with a simple, disruptive idea: connection should be direct, clean, and entirely free of agency noise.
        </p>
      </div>

      {/* 2. Brand Story / Bento card */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-5 leading-relaxed">
        <h2 className="text-lg font-bold text-neutral-900">The Hyrnex Mission</h2>
        <p className="text-sm text-neutral-600">
          In today’s recruitment landscape, candidates are forced to deal with automated resume-scraping agencies, relentless recruiter calls, and complex freelance marketplaces. Important visual portfolios, technical nuances, and candidate personalities get lost inside massive ATS databases.
        </p>
        <p className="text-sm text-neutral-600">
          Hyrnex removes all these friction points. We provide a hand-curated careers portal for top startups. There are no candidate logins, no profile synchronization, and no hidden placement fees. Candidates simply choose an interesting opportunity, upload their resume, and submit.
        </p>
        <p className="text-sm text-neutral-600 font-medium text-neutral-800">
          Our administrator processes every single submission directly, ensuring that true software craft and meticulous detail are noticed, leading to genuine conversations.
        </p>
      </div>

      {/* 3. Core Values Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-900">What Guides Us</h2>
          <p className="text-xs text-neutral-500 mt-1">Our core commitments to candidates and companies</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Direct Connections</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We never filter candidates through automated keyword scanning. Every single resume is read and analyzed by our platform’s real human administrator.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Privacy & Trust</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Your contact info and documents are kept entirely private. We never sell data, never cold-call, and only share documents directly with hiring partners.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Software Craftsmanship</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We focus on premium startup positions that appreciate clean code, gorgeous UI design systems, and rapid experimental marketing practices.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Zero Hassle Experience</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Apply in less than 2 minutes. No profiles, no password managers, no logging in. Simply provide your details, submit your file, and you’re done.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Team Call to Action */}
      <div className="bg-blue-600 p-8 rounded-3xl text-white text-center space-y-4 relative overflow-hidden shadow-lg">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-500 opacity-20 blur-xl" />
        <h2 className="text-2xl font-extrabold tracking-tight relative z-10">Ready to start your journey?</h2>
        <p className="text-xs text-blue-100 max-w-lg mx-auto relative z-10 leading-relaxed">
          Browse through our handpicked open positions at the world’s most innovative startups and submit your direct application in under 2 minutes.
        </p>
        <div className="pt-2 relative z-10">
          <button
            onClick={() => onNavigate('jobs')}
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-xs font-bold text-blue-600 transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
            id="about-cta-btn"
          >
            Browse Open Positions
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
