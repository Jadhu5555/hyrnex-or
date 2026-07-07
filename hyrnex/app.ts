import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DatabaseService, hashPassword, verifyPassword } from './server/db';
import { runAiAnalysis } from './server/ai';
import { logger } from './server/logger';
import {
  securityHeaders,
  rateLimiter,
  errorHandler,
  sanitizeRequestBody,
  validateJobInput,
  validateBlogInput,
  validateSettingsInput
} from './server/middleware';

const app = express();
const PORT = 3000;

// Centralized logging for requests
app.use((req, res, next) => {
  logger.debug('Express', `${req.method} ${req.path} - IP: ${req.ip || req.socket.remoteAddress}`);
  next();
});

// Apply Security Headers to all requests
app.use(securityHeaders);

// Increase payload limit for base64 file uploads (resumes) with sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeRequestBody);

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Secure Active Sessions with Expiration (24 Hour Validity)
interface SessionData {
  email: string;
  expiresAt: number;
}
const activeSessions = new Map<string, SessionData>();

// Periodic session cleanup
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of activeSessions.entries()) {
    if (now > data.expiresAt) {
      activeSessions.delete(token);
      logger.info('Auth', `Cleaned up expired session for email: ${data.email}`);
    }
  }
}, 30 * 60 * 1000); // run every 30 minutes

// Admin auth middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  const token = authHeader.substring(7);
  const session = activeSessions.get(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    logger.warn('Auth', `Unauthorized: Expired session token presented for email ${session.email}`);
    return res.status(401).json({ error: 'Unauthorized: Session expired, please login again' });
  }

  (req as any).adminEmail = session.email;
  next();
}

// ==========================================
// API ROUTES
// ==========================================

// --- Admin Authentication (with Rate Limiting to prevent Brute-Force) ---
app.post('/api/admin/login', rateLimiter(15 * 60 * 1000, 10, 'Too many login attempts. Please try again in 15 minutes.'), async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const admin = await DatabaseService.findAdminByEmail(email);
  if (!admin) {
    logger.warn('Auth', `Failed login attempt for email: ${email}`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Get admins list from DB directly to access the passwordHash
  const adminsRaw = await DatabaseService.getAdmins() as any[];
  const adminRaw = adminsRaw.find(a => a.email.toLowerCase() === email.toLowerCase());

  const isPasswordValid = adminRaw ? await verifyPassword(password, adminRaw.passwordHash) : false;
  if (!adminRaw || !isPasswordValid) {
    logger.warn('Auth', `Failed login password attempt for email: ${email}`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create token (24 hours expiry)
  const token = `hyrnex_token_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  activeSessions.set(token, { email: admin.email, expiresAt });

  logger.info('Auth', `Admin logged in successfully: ${admin.email}`);

  res.json({
    token,
    admin: {
      email: admin.email,
      name: admin.name
    }
  });
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = activeSessions.get(token);
    if (session) {
      activeSessions.delete(token);
      logger.info('Auth', `Admin logged out successfully: ${session.email}`);
    }
  }
  res.json({ success: true });
});

app.get('/api/admin/me', requireAdmin, async (req, res) => {
  const email = (req as any).adminEmail;
  const admin = await DatabaseService.findAdminByEmail(email);
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }
  res.json({ admin });
});

// --- Admin System Logs Retrieval Endpoint (New Audit Feature) ---
app.get('/api/admin/logs', requireAdmin, (req, res) => {
  res.json({ logs: logger.getLogs() });
});

// --- Public / Admin Jobs (with Search, Filtering, and Pagination) ---
app.get('/api/jobs', async (req, res) => {
  const { search, category, employmentType, page, limit } = req.query;
  
  // Authorization check for Admin views
  const authHeader = req.headers.authorization;
  let isAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = activeSessions.get(token);
    if (session && Date.now() < session.expiresAt) {
      isAdmin = true;
    }
  }

  const queryPage = page ? parseInt(page as string, 10) : undefined;
  const queryLimit = limit ? parseInt(limit as string, 10) : undefined;

  const allJobs = await DatabaseService.getJobs({
    search: search ? (search as string) : undefined,
    category: category ? (category as string) : undefined,
    employmentType: employmentType ? (employmentType as string) : undefined,
    status: isAdmin ? undefined : 'published', // Public views only published, Admin views all
    page: queryPage,
    limit: queryLimit
  });

  if (isAdmin) {
    res.json(allJobs);
  } else {
    // Public filtering on date constraints
    const now = new Date().toISOString().split('T')[0];
    const publicJobs = allJobs.filter(j => !j.expiryDate || j.expiryDate >= now);
    res.json(publicJobs);
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  const job = await DatabaseService.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job post not found' });
  }
  res.json(job);
});

app.post('/api/jobs', requireAdmin, validateJobInput, async (req, res) => {
  try {
    const newJob = await DatabaseService.createJob(req.body);
    res.status(201).json(newJob);
  } catch (error: any) {
    logger.error('Jobs', `Failed to create job: ${error.message}`);
    res.status(400).json({ error: error.message || 'Failed to create job' });
  }
});

app.put('/api/jobs/:id', requireAdmin, validateJobInput, async (req, res) => {
  try {
    const updatedJob = await DatabaseService.updateJob(req.params.id, req.body);
    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(updatedJob);
  } catch (error: any) {
    logger.error('Jobs', `Failed to update job ID ${req.params.id}: ${error.message}`);
    res.status(400).json({ error: error.message || 'Failed to update job' });
  }
});

app.delete('/api/jobs/:id', requireAdmin, async (req, res) => {
  const success = await DatabaseService.deleteJob(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({ success: true });
});

app.post('/api/jobs/duplicate/:id', requireAdmin, async (req, res) => {
  const existingJob = await DatabaseService.getJobById(req.params.id);
  if (!existingJob) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const { id, publishedDate, ...jobData } = existingJob;
  const duplicatedJob = await DatabaseService.createJob({
    ...jobData,
    title: `${jobData.title} (Copy)`,
    status: 'draft' // Duplicate as draft
  });

  res.status(201).json(duplicatedJob);
});

// --- Public / Admin Blogs (with Search and Pagination) ---
app.get('/api/blogs', async (req, res) => {
  const { search, page, limit } = req.query;

  const authHeader = req.headers.authorization;
  let isAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = activeSessions.get(token);
    if (session && Date.now() < session.expiresAt) {
      isAdmin = true;
    }
  }

  const queryPage = page ? parseInt(page as string, 10) : undefined;
  const queryLimit = limit ? parseInt(limit as string, 10) : undefined;

  const blogs = await DatabaseService.getBlogs({
    search: search ? (search as string) : undefined,
    draft: isAdmin ? undefined : false, // Public views only non-draft blogs, Admin views all
    page: queryPage,
    limit: queryLimit
  });

  res.json(blogs);
});

app.get('/api/blogs/:id', async (req, res) => {
  const blog = await DatabaseService.getBlogById(req.params.id);
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' });
  }
  res.json(blog);
});

app.get('/api/blogs/slug/:slug', async (req, res) => {
  const blog = await DatabaseService.getBlogBySlug(req.params.slug);
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' });
  }
  res.json(blog);
});

app.post('/api/blogs', requireAdmin, validateBlogInput, async (req, res) => {
  try {
    const newBlog = await DatabaseService.createBlog(req.body);
    res.status(201).json(newBlog);
  } catch (error: any) {
    logger.error('Blogs', `Failed to create blog: ${error.message}`);
    res.status(400).json({ error: error.message || 'Failed to create blog' });
  }
});

app.put('/api/blogs/:id', requireAdmin, validateBlogInput, async (req, res) => {
  try {
    const updatedBlog = await DatabaseService.updateBlog(req.params.id, req.body);
    if (!updatedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(updatedBlog);
  } catch (error: any) {
    logger.error('Blogs', `Failed to update blog ID ${req.params.id}: ${error.message}`);
    res.status(400).json({ error: error.message || 'Failed to update blog' });
  }
});

app.delete('/api/blogs/:id', requireAdmin, async (req, res) => {
  const success = await DatabaseService.deleteBlog(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Blog not found' });
  }
  res.json({ success: true });
});


// ==========================================
// SEO ROUTES (Sitemap & robots.txt)
// ==========================================
app.get('/robots.txt', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin-dashboard\n\nSitemap: ${host}/sitemap.xml`);
});

app.get('/sitemap.xml', async (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  const jobs = (await DatabaseService.getJobs()).filter(j => j.status === 'published');
  const blogs = (await DatabaseService.getBlogs()).filter(b => !b.draft);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  const today = new Date().toISOString().split('T')[0];
  xml += `  <url><loc>${host}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
  xml += `  <url><loc>${host}/jobs</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
  xml += `  <url><loc>${host}/about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
  xml += `  <url><loc>${host}/blog</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  xml += `  <url><loc>${host}/contact</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
  
  jobs.forEach(job => {
    xml += `  <url><loc>${host}/jobs?jobId=${job.id}</loc><lastmod>${job.publishedDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  });
  
  blogs.forEach(blog => {
    const blogDate = blog.createdAt ? blog.createdAt.split('T')[0] : today;
    xml += `  <url><loc>${host}/blog?slug=${blog.slug}</loc><lastmod>${blogDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  });
  
  xml += `</urlset>`;
  
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// --- Settings ---
// Public settings route (strips secret credentials for safety)
app.get('/api/settings', async (req, res) => {
  const fullSettings = await DatabaseService.getSettings();
  const { cloudinaryCloudName, cloudinaryUploadPreset, ...publicSettings } = fullSettings;
  res.json(publicSettings);
});

// Admin-only settings route (returns full credentials)
app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  res.json(await DatabaseService.getSettings());
});

app.put('/api/settings', requireAdmin, validateSettingsInput, async (req, res) => {
  try {
    const updated = await DatabaseService.updateSettings(req.body);
    res.json(updated);
  } catch (error: any) {
    logger.error('Settings', `Failed to update settings: ${error.message}`);
    res.status(400).json({ error: error.message || 'Failed to update settings' });
  }
});

// Helper route to update admin password
app.put('/api/admin/change-password', requireAdmin, async (req, res) => {
  const { newPassword } = req.body;
  const email = (req as any).adminEmail;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const success = await DatabaseService.updateAdminPassword(email, newPassword);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Admin not found' });
  }
});

// Global Error Handling Middleware (Centralized Error Handling)
app.use(errorHandler);

// ==========================================
// VITE OR STATIC FRONTEND SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Validate critical Environment Variables on boot
  if (!process.env.GEMINI_API_KEY) {
    logger.warn('System', 'GEMINI_API_KEY environment variable is not defined. The app will gracefully fall back to heuristic match scoring.');
  } else {
    logger.info('System', 'GEMINI_API_KEY loaded successfully. AI Matching engine is fully active.');
  }

  // Do not call listen on Vercel serverless environment
  if (process.env.VERCEL || process.env.NOW_REGION) {
    logger.info('System', 'Vercel Serverless environment detected. Skipping app.listen().');
    return;
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info('System', `Hyrnex audited server running at http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
export default app;
