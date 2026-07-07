import React, { useState, useEffect } from 'react';
import { Blog } from '../types';
import { Newspaper, Clock, ArrowLeft, ArrowRight, AlertCircle, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CareerBlogProps {
  blogs: Blog[];
  onNavigate: (page: string, params?: Record<string, any>) => void;
  selectedSlug?: string;
}

export const CareerBlog: React.FC<CareerBlogProps> = ({
  blogs,
  onNavigate,
  selectedSlug = ''
}) => {
  const [activeSlug, setActiveSlug] = useState(selectedSlug);

  useEffect(() => {
    setActiveSlug(selectedSlug);
    // Scroll to top when view changes
    window.scrollTo({ top: 0 });
  }, [selectedSlug]);

  // Find currently active blog details
  const activeBlog = blogs.find(b => b.slug === activeSlug);

  // Filter public non-draft blogs
  const publicBlogs = blogs.filter(b => !b.draft);

  // Render HTML/Markdown-like text beautifully
  const renderContent = (content: string) => {
    return content.split('\n').map((para, index) => {
      const trimmed = para.trim();
      if (trimmed.startsWith('###')) {
        return (
          <h3 key={index} className="text-base font-bold text-neutral-900 mt-6 mb-3">
            {trimmed.replace('###', '').trim()}
          </h3>
        );
      } else if (trimmed.startsWith('##')) {
        return (
          <h2 key={index} className="text-lg font-bold text-neutral-900 mt-8 mb-4">
            {trimmed.replace('##', '').trim()}
          </h2>
        );
      } else if (trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.')) {
        return (
          <p key={index} className="text-sm text-neutral-700 font-medium pl-2 mt-2 leading-relaxed">
            {trimmed}
          </p>
        );
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <li key={index} className="text-sm text-neutral-600 pl-4 list-disc mt-1 leading-relaxed">
            {trimmed.substring(1).trim()}
          </li>
        );
      } else if (trimmed === '') {
        return <div key={index} className="h-2" />;
      } else {
        return (
          <p key={index} className="text-sm text-neutral-600 mt-2.5 leading-relaxed">
            {trimmed}
          </p>
        );
      }
    });
  };

  // 1. DETAIL VIEW
  if (activeSlug && activeBlog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 font-sans space-y-6" id="blog-details-view">
        {/* Back Link */}
        <button
          onClick={() => {
            setActiveSlug('');
            onNavigate('blog');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          id="back-to-blog-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Career Blog
        </button>

        {/* Blog Meta Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium">
            <span>Published {new Date(activeBlog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {activeBlog.readingTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3.5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
            {activeBlog.title}
          </h1>

          <div className="flex items-center gap-2 border-y border-neutral-100 py-3 text-xs font-semibold text-neutral-600">
            <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>Hyrnex Careers Team</span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="h-64 sm:h-96 rounded-2xl overflow-hidden bg-neutral-100 shadow-sm">
          <img
            src={activeBlog.image}
            alt={activeBlog.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Rich Body Content */}
        <div className="prose max-w-none pt-4 pb-12">
          {renderContent(activeBlog.content)}
        </div>
      </div>
    );
  }

  // 2. LIST VIEW
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-sans space-y-12" id="blog-list-view">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Hyrnex Career Blog</h1>
        <p className="text-sm text-neutral-500 mt-1.5">Expert industry guides, resume builders, and technical interview walkthroughs.</p>
      </div>

      {/* Featured Blog (Latest Post) */}
      {publicBlogs.length > 0 && (
        <div
          onClick={() => {
            setActiveSlug(publicBlogs[0].slug);
            onNavigate('blog', { slug: publicBlogs[0].slug });
          }}
          className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden group cursor-pointer flex flex-col lg:flex-row gap-6 lg:gap-0 card-shadow-hover"
          id="blog-featured-article"
        >
          <div className="w-full lg:w-1/2 h-64 lg:h-80 overflow-hidden bg-neutral-100">
            <img
              src={publicBlogs[0].image}
              alt={publicBlogs[0].title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                Featured Article
              </span>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span>{new Date(publicBlogs[0].createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {publicBlogs[0].readingTime}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug group-hover:text-blue-600 transition-colors">
                {publicBlogs[0].title}
              </h2>
              <p className="text-sm text-neutral-500 line-clamp-3 leading-relaxed">
                {publicBlogs[0].seo}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-6 group-hover:gap-2.5 transition-all cursor-pointer">
              Read article <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      )}

      {/* Grid of Other Blogs */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-neutral-800 border-b border-neutral-100 pb-3">Latest Career Articles</h2>

        {publicBlogs.length <= 1 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-neutral-100 shadow-sm text-neutral-400 text-xs">
            <Newspaper className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
            No other blog articles published yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {publicBlogs.slice(1).map((blog) => (
              <div
                key={blog.id}
                onClick={() => {
                  setActiveSlug(blog.slug);
                  onNavigate('blog', { slug: blog.slug });
                }}
                className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden group cursor-pointer flex flex-col justify-between card-shadow-hover"
                id={`blog-grid-card-${blog.id}`}
              >
                <div>
                  <div className="h-48 overflow-hidden bg-neutral-100 relative">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold text-neutral-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {blog.readingTime}
                    </div>
                  </div>
                  <div className="p-6 space-y-2.5">
                    <p className="text-[10px] font-semibold text-neutral-400">
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 line-clamp-2 leading-relaxed">
                      {blog.seo}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-1.5 transition-all cursor-pointer">
                    Read article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
