import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// In-memory rate limiting store
interface RateLimitInfo {
  count: number;
  resetTime: number;
}
const rateLimitStore = new Map<string, RateLimitInfo>();

/**
 * Middleware: Set Standard Security Headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https:; font-src 'self' https: data:");
  next();
}

/**
 * Middleware Creator: Rate Limiter
 * @param windowMs Time window in milliseconds
 * @param max Maximum number of requests in the window
 * @param message Error message to return
 */
export function rateLimiter(windowMs: number, max: number, message: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const rateInfo = rateLimitStore.get(key);
    if (!rateInfo) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (now > rateInfo.resetTime) {
      // Reset window
      rateInfo.count = 1;
      rateInfo.resetTime = now + windowMs;
      rateLimitStore.set(key, rateInfo);
      return next();
    }

    rateInfo.count++;
    if (rateInfo.count > max) {
      logger.warn('Security', `Rate limit exceeded for IP ${ip} on path ${req.path}`);
      return res.status(429).json({ error: message });
    }

    rateLimitStore.set(key, rateInfo);
    next();
  };
}

/**
 * Middleware: Global Async Error Handler
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error('Express', `Unhandled Error: ${message} - Status: ${status} - Stack: ${err.stack}`);

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString()
  });
}

/**
 * Validation Utility: Safe Sanitization of String Inputs to Prevent XSS / Scripts
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Basic sanitization: strip HTML tags to prevent XSS script tags
    return input.replace(/<[^>]*>/g, '').trim();
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  if (input !== null && typeof input === 'object') {
    const sanitizedObj: any = {};
    for (const key of Object.keys(input)) {
      sanitizedObj[key] = sanitizeInput(input[key]);
    }
    return sanitizedObj;
  }
  return input;
}

/**
 * Middleware: Sanitize entire request body
 */
export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
}

/**
 * Express Request Validators
 */
export function validateJobInput(req: Request, res: Response, next: NextFunction) {
  const { title, company, experience, category, employmentType, vacancies, description, requirements, status, expiryDate } = req.body;

  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters.');
  }
  if (!company || typeof company !== 'string' || company.trim().length === 0) {
    errors.push('Company name is required.');
  }
  if (!experience || typeof experience !== 'string') {
    errors.push('Experience level is required.');
  }
  if (!category || typeof category !== 'string') {
    errors.push('Category is required.');
  }
  if (!employmentType || typeof employmentType !== 'string') {
    errors.push('Employment Type is required.');
  }
  if (vacancies === undefined || typeof vacancies !== 'number' || vacancies <= 0) {
    errors.push('Vacancies must be a positive number.');
  }
  if (!description || typeof description !== 'string' || description.trim().length < 20) {
    errors.push('Description is required and must be at least 20 characters.');
  }
  if (!requirements || typeof requirements !== 'string' || requirements.trim().length < 10) {
    errors.push('Requirements are required and must be at least 10 characters.');
  }
  if (expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
    errors.push('Expiry Date must be a valid date in YYYY-MM-DD format.');
  }
  if (status && !['published', 'draft', 'archived', 'closed'].includes(status)) {
    errors.push('Invalid job status.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

export function validateBlogInput(req: Request, res: Response, next: NextFunction) {
  const { title, slug, content, image, readingTime } = req.body;

  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    errors.push('Title is required and must be at least 5 characters.');
  }
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug is required and must contain only alphanumeric lowercase letters and hyphens (e.g. sample-blog-post).');
  }
  if (!content || typeof content !== 'string' || content.trim().length < 50) {
    errors.push('Content must be a detailed write-up of at least 50 characters.');
  }
  if (!image || typeof image !== 'string' || (!image.startsWith('http://') && !image.startsWith('https://'))) {
    errors.push('Image must be a valid HTTP or HTTPS URL.');
  }
  if (!readingTime || typeof readingTime !== 'string') {
    errors.push('Reading time (e.g. "4 min read") is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

export function validateSettingsInput(req: Request, res: Response, next: NextFunction) {
  const { siteName, contactEmail, contactPhone, address } = req.body;

  const errors: string[] = [];

  if (!siteName || typeof siteName !== 'string' || siteName.trim().length === 0) {
    errors.push('Site Name is required.');
  }
  if (!contactEmail || typeof contactEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    errors.push('A valid contact email is required.');
  }
  if (!contactPhone || typeof contactPhone !== 'string') {
    errors.push('Contact phone is required.');
  }
  if (!address || typeof address !== 'string') {
    errors.push('Physical address is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}
