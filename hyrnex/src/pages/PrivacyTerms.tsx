import React, { useEffect } from 'react';
import { ShieldAlert, Scale, HelpCircle } from 'lucide-react';

interface PrivacyTermsProps {
  view: 'privacy' | 'terms';
}

export const PrivacyTerms: React.FC<PrivacyTermsProps> = ({ view }) => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  if (view === 'privacy') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 font-sans space-y-8" id="privacy-policy-page">
        <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
          <ShieldAlert className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-neutral-400 font-medium">Last updated: July 2026</p>
          </div>
        </div>

        <div className="prose prose-neutral text-sm text-neutral-600 leading-relaxed space-y-5">
          <p>
            At <strong>Hyrnex</strong>, accessible from our careers application portal, candidate privacy is one of our utmost core priorities. This Privacy Policy document details the types of personal data we collect, record, and process when candidates submit their details and resumes.
          </p>

          <h2 className="text-base font-bold text-neutral-900 pt-3">1. Information We Collect</h2>
          <p>
            When you apply for a job posting on Hyrnex, we collect the personal details you voluntarily provide in our application form. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Personal identification (Full name, Email address, Phone number).</li>
            <li>Geographical information (Country, City of residence).</li>
            <li>Professional profile (Highest level of education, years of experience, current skills, current salary, expected salary, current company, notice period).</li>
            <li>Social presence (LinkedIn URLs, personal portfolio links, GitHub accounts).</li>
            <li>Uploaded documents (Resume/CV files, cover letters).</li>
          </ul>

          <h2 className="text-base font-bold text-neutral-900 pt-3">2. How We Use Your Information</h2>
          <p>
            We process candidate data strictly to facilitate the application review and assessment process. Specifically, your details are used to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verify and assess your professional qualifications against the job requirements.</li>
            <li>Directly transmit your application details to the platform administrator.</li>
            <li>Coordinate potential screening and interview schedules with you.</li>
            <li>Maintain historical recruitment statistics on our secure admin dashboard.</li>
          </ul>

          <h2 className="text-base font-bold text-neutral-900 pt-3">3. Data Storage and Security</h2>
          <p>
            We deploy multiple layers of industry-standard security to ensure candidate files are safeguarded:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Resumes are stored securely in Cloudinary environments or encapsulated within local disk storage directories on our servers.</li>
            <li>All data transmissions are fully encrypted using Secure Socket Layer (SSL/TLS) configurations.</li>
            <li>Access to the administrative dashboard is strictly restricted through crytpographic token credentials. Only our authorized platform administrator can view candidate logs or download files.</li>
          </ul>

          <h2 className="text-base font-bold text-neutral-900 pt-3">4. Candidates Rights</h2>
          <p>
            You have full autonomy over your personal information. Candidates can request the absolute deletion of their application details or uploaded resumes from our server logs at any time. Simply contact us at <a href="mailto:privacy@hyrnex.com" className="text-blue-600 hover:underline font-semibold">privacy@hyrnex.com</a>, and we will purge your files from our active database and Cloudinary storage immediately.
          </p>
        </div>
      </div>
    );
  }

  // TERMS OF SERVICE VIEW
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 font-sans space-y-8" id="terms-of-service-page">
      <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
        <Scale className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Terms of Service</h1>
          <p className="text-xs text-neutral-400 font-medium">Last updated: July 2026</p>
        </div>
      </div>

      <div className="prose prose-neutral text-sm text-neutral-600 leading-relaxed space-y-5">
        <p>
          Welcome to <strong>Hyrnex</strong>. By accessing our website, browsing open career listings, uploading documents, or applying for job posts, you agree to abide by and be bound by the following Terms of Service.
        </p>

        <h2 className="text-base font-bold text-neutral-900 pt-3">1. Agreement to Terms</h2>
        <p>
          By utilizing the Hyrnex careers portal, you confirm that you are at least 18 years of age, or possess legal guardian consent, and are fully capable and competent to enter into the terms, conditions, obligations, and representations set forth in these Terms. If you do not agree with any part of these terms, you must cease using our portal immediately.
        </p>

        <h2 className="text-base font-bold text-neutral-900 pt-3">2. User Conduct & Submissions</h2>
        <p>
          You are entirely responsible for the accuracy, truthfulness, and legality of all information you input into our recruitment forms and any file attachments you upload. You agree that:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>You will not upload any resumes or files containing malware, scripts, or destructive payloads.</li>
          <li>You will not impersonate any person or entity, or provide false or misleading academic or professional qualifications.</li>
          <li>The uploaded files are indeed professional resumes/CV documents representing your own profile.</li>
        </ul>

        <h2 className="text-base font-bold text-neutral-900 pt-3">3. Disclaimer & Limitations</h2>
        <p>
          Hyrnex is a direct-to-administrator job submission conduit. We do not guarantee that any candidate submission will result in an immediate callback, interview arrangement, or successful placement. All job descriptions and terms are subject to adjustment without prior notification. Hyrnex will not be held liable for any damages or contract losses resulting from the use or inability to use our platform.
        </p>

        <h2 className="text-base font-bold text-neutral-900 pt-3">4. Amendments to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time. Any changes will be published directly on this page with an adjusted date indicator. Continual usage of our website following any adjustments indicates your full acceptance of the revised Terms.
        </p>
      </div>
    </div>
  );
};
