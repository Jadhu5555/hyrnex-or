import React from 'react';
import { Logo } from './Logo';
import { Mail, Phone, MapPin, Linkedin, Github, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  siteName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  siteName = 'Hyrnex',
  email = 'hello@hyrnex.com',
  phone = '+1 (555) 019-2834',
  address = '100 Pine Street, San Francisco, CA 94111'
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-100 font-sans" id="site-footer">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and Tagline */}
          <div className="space-y-4 xl:col-span-1">
            <Logo iconSize={36} />
            <p className="text-sm text-neutral-500 max-w-xs">
              Your Career Starts Here. Connecting exceptional talents with top-tier startup engineering, design, and marketing teams.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="LinkedIn"
                id="footer-social-linkedin"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="GitHub"
                id="footer-social-github"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Twitter"
                id="footer-social-twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links and Contact info */}
          <div className="mt-8 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Platform
                </h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <button
                      onClick={() => onNavigate('jobs')}
                      className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      id="footer-link-jobs"
                    >
                      Browse Jobs
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('blog')}
                      className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      id="footer-link-blog"
                    >
                      Career Blog
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('about')}
                      className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      id="footer-link-about"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('contact')}
                      className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      id="footer-link-contact"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
              </div>
              <div className="mt-8 md:mt-0">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Legal
                </h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <button
                      onClick={() => onNavigate('privacy')}
                      className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      id="footer-link-privacy"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('terms')}
                      className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      id="footer-link-terms"
                    >
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('admin-login')}
                      className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                      id="footer-link-admin"
                    >
                      Admin Access
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact details */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Get in Touch
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-500">
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <a href={`mailto:${email}`} className="hover:text-neutral-800 transition-colors">
                    {email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <span>{phone}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>{address}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="mt-12 border-t border-neutral-100 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-neutral-400">
            &copy; {currentYear} {siteName}. All rights reserved.
          </p>
          <p className="text-xs text-neutral-400 flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-semibold text-neutral-600">Hyrnex Core Engine</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
