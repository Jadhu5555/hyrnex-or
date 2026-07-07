import React, { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Twitter, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export const Contact: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !message) return;
    
    setIsSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 font-sans space-y-12" id="contact-page">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Get in Touch</h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Have questions about job submissions, partner openings, or technical configurations? Send us a message and our careers team will respond in under 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        
        {/* Contact Info & Google Map Placeholder */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-neutral-800">Platform Contact Details</h2>
            
            <ul className="space-y-4 text-xs font-semibold text-neutral-600">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">EMAIL INQUIRIES</p>
                  <a href="mailto:hello@hyrnex.com" className="text-neutral-700 hover:text-blue-600 transition-colors">
                    hello@hyrnex.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">SUPPORT HOTLINE</p>
                  <span className="text-neutral-700">+1 (555) 019-2834</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">HEADQUARTERS OFFICE</p>
                  <span className="text-neutral-700">100 Pine Street, San Francisco, CA 94111</span>
                </div>
              </li>
            </ul>

            <div className="pt-4 border-t border-neutral-50 flex gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-all flex items-center justify-center">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-all flex items-center justify-center">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-all flex items-center justify-center">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Google Map Placeholder */}
          <div className="bg-neutral-100 border border-neutral-200/50 rounded-2xl overflow-hidden h-64 relative shadow-sm">
            {/* Minimal SVG map mockup representation */}
            <svg className="absolute inset-0 w-full h-full text-neutral-200" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 L100,50 M50,0 L50,100 M20,0 L80,100 M0,80 L100,20" stroke="#e5e5e5" strokeWidth="1" />
              <circle cx="50" cy="50" r="1.5" fill="#3b82f6" />
              <circle cx="50" cy="50" r="4" fill="#3b82f6" fillOpacity="0.15" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-neutral-100/50 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">
                H
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">Hyrnex San Francisco Office</p>
                <p className="text-[10px] text-neutral-400">100 Pine Street, CA 94111</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-neutral-800 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Send a Message
          </h2>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-center space-y-3 animate-fade-in" id="contact-success-box">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold">Message Submitted Successfully</h3>
              <p className="text-xs text-emerald-600 leading-relaxed max-w-xs mx-auto">
                Thank you for contacting Hyrnex. Our recruitment platform administrator will check your message and follow up shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" id="contact-form">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 bg-[#fafafa]"
                  id="contact-name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 bg-[#fafafa]"
                  id="contact-email"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Your Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Explain what you need assistance with..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 bg-[#fafafa] resize-y"
                  id="contact-message"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                id="contact-submit-btn"
              >
                <Send className="w-3.5 h-3.5" />
                Send Message Inquiry
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
