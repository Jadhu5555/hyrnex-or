import React, { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X, Briefcase, Info, FileText, Mail, ShieldAlert, LayoutDashboard, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  isAdminLoggedIn,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', page: 'home', icon: null },
    { label: 'Jobs', page: 'jobs', icon: Briefcase },
    { label: 'About', page: 'about', icon: Info },
    { label: 'Blog', page: 'blog', icon: FileText },
    { label: 'Contact', page: 'contact', icon: Mail }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-100 nav-blur card-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            className="cursor-pointer" 
            onClick={() => { onNavigate('home'); setIsOpen(false); }}
            id="nav-logo"
          >
            <Logo iconSize={34} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`text-sm font-medium transition-all duration-200 cursor-pointer ${
                  currentPage === item.page || (item.page === 'blog' && currentPage === 'blog-details')
                    ? 'text-blue-600'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
                id={`nav-item-${item.page}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA / Admin state */}
          <div className="hidden md:flex items-center gap-4">
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                  id="nav-admin-dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Admin Console
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                  id="nav-admin-logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('jobs')}
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow cursor-pointer"
                id="nav-cta-jobs"
              >
                Apply Now
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-500 hover:text-neutral-700 p-2 rounded-lg"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white/95 backdrop-blur-md animate-fade-in" id="mobile-menu-container">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center px-4 py-3 text-base font-medium rounded-lg ${
                  currentPage === item.page
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
                id={`mobile-nav-item-${item.page}`}
              >
                {item.label}
              </button>
            ))}

            <div className="border-t border-neutral-100 my-2 pt-2 px-4">
              {isAdminLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      onNavigate('admin-dashboard');
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm font-semibold text-neutral-800"
                    id="mobile-nav-admin"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Console
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 text-sm font-semibold text-rose-600"
                    id="mobile-nav-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('jobs');
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-center py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow"
                  id="mobile-nav-cta"
                >
                  Browse Jobs
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
