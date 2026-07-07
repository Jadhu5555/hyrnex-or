import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { Admin, Job, Blog, Settings } from '../src/types';
import { logger } from './logger';

export const prisma = new PrismaClient();

// Helper to hash password using bcrypt
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

// Helper to verify password (with automatic SHA-256 to bcrypt migration)
export async function verifyPassword(passwordPlain: string, storedHash: string): Promise<boolean> {
  const isBcrypt = storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$');
  if (isBcrypt) {
    return await bcrypt.compare(passwordPlain, storedHash);
  } else {
    // Fallback to SHA-256
    const sha256Hash = crypto.createHash('sha256').update(passwordPlain).digest('hex');
    const matches = sha256Hash === storedHash;
    if (matches) {
      // Migrate password hash to bcrypt
      try {
        const newBcryptHash = bcrypt.hashSync(passwordPlain, 12);
        await prisma.admin.updateMany({
          where: { passwordHash: storedHash },
          data: { passwordHash: newBcryptHash }
        });
        logger.info('Database', `Successfully migrated admin password hash from SHA-256 to bcrypt upon successful login`);
      } catch (err) {
        logger.error('Database', `Failed to migrate legacy SHA-256 password hash to bcrypt: ${err}`);
      }
    }
    return matches;
  }
}

function mapAdmin(admin: any): Admin {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    createdAt: admin.createdAt.toISOString()
  };
}

function mapJob(job: any): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    logo: job.logo,
    country: job.country,
    city: job.city,
    salary: job.salary,
    experience: job.experience,
    category: job.category,
    employmentType: job.employmentType,
    vacancies: job.vacancies,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    benefits: job.benefits,
    featured: job.featured,
    urgent: job.urgent,
    publishedDate: job.publishedDate,
    expiryDate: job.expiryDate,
    status: job.status as any,
  };
}

function mapBlog(blog: any): Blog {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    image: blog.image,
    seo: blog.seo,
    readingTime: blog.readingTime,
    draft: blog.draft,
    createdAt: blog.createdAt.toISOString(),
  };
}

function mapSettings(settings: any): Settings {
  return {
    siteName: settings.siteName,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    address: settings.address,
    linkedinUrl: settings.linkedinUrl,
    githubUrl: settings.githubUrl,
    twitterUrl: settings.twitterUrl,
    cloudinaryCloudName: settings.cloudinaryCloudName,
    cloudinaryUploadPreset: settings.cloudinaryUploadPreset,
  };
}

export class DatabaseService {
  // --- Admin Methods ---
  static async getAdmins() {
    const admins = await prisma.admin.findMany();
    return admins;
  }

  static async findAdminByEmail(email: string) {
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (!admin) return null;
    return mapAdmin(admin);
  }

  static async updateAdminPassword(email: string, newPasswordPlain: string) {
    try {
      const passwordHash = hashPassword(newPasswordPlain);
      await prisma.admin.update({
        where: { email: email.toLowerCase() },
        data: { passwordHash }
      });
      logger.info('Database', `Password updated successfully for admin email: ${email}`);
      return true;
    } catch (e) {
      logger.error('Database', `Failed to update admin password: ${e}`);
      return false;
    }
  }

  // --- Jobs Methods (with search, filtering, and pagination) ---
  static async getJobs(options?: { search?: string; category?: string; employmentType?: string; status?: string; page?: number; limit?: number }) {
    const where: any = {};

    if (options) {
      if (options.status) {
        where.status = options.status;
      }
      if (options.category) {
        where.category = {
          equals: options.category,
          mode: 'insensitive'
        };
      }
      if (options.employmentType) {
        where.employmentType = {
          equals: options.employmentType,
          mode: 'insensitive'
        };
      }
      if (options.search) {
        const searchVal = options.search;
        where.OR = [
          { title: { contains: searchVal, mode: 'insensitive' } },
          { company: { contains: searchVal, mode: 'insensitive' } },
          { description: { contains: searchVal, mode: 'insensitive' } },
          { requirements: { contains: searchVal, mode: 'insensitive' } },
        ];
      }
    }

    const skip = options?.page && options?.limit ? (options.page - 1) * options.limit : undefined;
    const take = options?.limit ? options.limit : undefined;

    const jobs = await prisma.job.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take
    });

    return jobs.map(mapJob);
  }

  static async getJobById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id }
    });
    if (!job) return null;
    return mapJob(job);
  }

  static async createJob(jobData: Omit<Job, 'id' | 'publishedDate'>) {
    const publishedDate = new Date().toISOString().split('T')[0];
    const newJob = await prisma.job.create({
      data: {
        ...jobData,
        publishedDate,
      }
    });
    logger.info('Database', `Job created successfully: "${newJob.title}" at ${newJob.company}`);
    return mapJob(newJob);
  }

  static async updateJob(id: string, jobData: Partial<Job>) {
    try {
      const { id: _, ...updateData } = jobData;
      const updated = await prisma.job.update({
        where: { id },
        data: updateData as any
      });
      logger.info('Database', `Job updated successfully: ID ${id}`);
      return mapJob(updated);
    } catch (e: any) {
      logger.error('Database', `Failed to update job ID ${id}: ${e.message}`);
      return null;
    }
  }

  static async deleteJob(id: string) {
    try {
      await prisma.job.delete({
        where: { id }
      });
      logger.info('Database', `Job deleted successfully: ID ${id}`);
      return true;
    } catch (e) {
      logger.error('Database', `Failed to delete job ID ${id}: ${e}`);
      return false;
    }
  }

  // --- Blogs Methods (with search, filtering, and pagination) ---
  static async getBlogs(options?: { search?: string; draft?: boolean; page?: number; limit?: number }) {
    const where: any = {};

    if (options) {
      if (options.draft !== undefined) {
        where.draft = options.draft;
      }
      if (options.search) {
        const searchVal = options.search;
        where.OR = [
          { title: { contains: searchVal, mode: 'insensitive' } },
          { content: { contains: searchVal, mode: 'insensitive' } },
          { seo: { contains: searchVal, mode: 'insensitive' } },
        ];
      }
    }

    const skip = options?.page && options?.limit ? (options.page - 1) * options.limit : undefined;
    const take = options?.limit ? options.limit : undefined;

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take
    });

    return blogs.map(mapBlog);
  }

  static async getBlogById(id: string) {
    const blog = await prisma.blog.findUnique({
      where: { id }
    });
    if (!blog) return null;
    return mapBlog(blog);
  }

  static async getBlogBySlug(slug: string) {
    const blog = await prisma.blog.findUnique({
      where: { slug }
    });
    if (!blog) return null;
    return mapBlog(blog);
  }

  static async createBlog(blogData: Omit<Blog, 'id' | 'createdAt'>) {
    const existing = await prisma.blog.findUnique({
      where: { slug: blogData.slug }
    });
    if (existing) {
      throw new Error(`The slug "${blogData.slug}" is already in use by another article. Please choose a unique URL slug.`);
    }

    const newBlog = await prisma.blog.create({
      data: blogData
    });
    logger.info('Database', `Blog post created successfully: "${newBlog.title}" (slug: ${newBlog.slug})`);
    return mapBlog(newBlog);
  }

  static async updateBlog(id: string, blogData: Partial<Blog>) {
    try {
      if (blogData.slug) {
        const existing = await prisma.blog.findFirst({
          where: {
            slug: blogData.slug,
            NOT: { id }
          }
        });
        if (existing) {
          throw new Error(`The slug "${blogData.slug}" is already in use by another article.`);
        }
      }

      const { id: _, ...updateData } = blogData;
      const updated = await prisma.blog.update({
        where: { id },
        data: updateData as any
      });
      logger.info('Database', `Blog post updated successfully: ID ${id}`);
      return mapBlog(updated);
    } catch (e: any) {
      logger.error('Database', `Failed to update blog post ID ${id}: ${e.message}`);
      throw e;
    }
  }

  static async deleteBlog(id: string) {
    try {
      await prisma.blog.delete({
        where: { id }
      });
      logger.info('Database', `Blog post deleted successfully: ID ${id}`);
      return true;
    } catch (e) {
      logger.error('Database', `Failed to delete blog post ID ${id}: ${e}`);
      return false;
    }
  }

  // --- Settings Methods ---
  static async getSettings() {
    let settings = await prisma.settings.findUnique({
      where: { id: 'default' }
    });
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'default',
          siteName: 'Hyrnex',
          contactEmail: 'hello@hyrnex.com',
          contactPhone: '+1 (555) 019-2834',
          address: '100 Pine Street, San Francisco, CA 94111',
          linkedinUrl: 'https://linkedin.com/company/hyrnex',
          githubUrl: 'https://github.com/hyrnex',
          twitterUrl: 'https://twitter.com/hyrnex',
          cloudinaryCloudName: '',
          cloudinaryUploadPreset: ''
        }
      });
    }
    return mapSettings(settings);
  }

  static async updateSettings(settingsData: Partial<Settings>) {
    const updated = await prisma.settings.upsert({
      where: { id: 'default' },
      update: settingsData,
      create: {
        id: 'default',
        siteName: settingsData.siteName || 'Hyrnex',
        contactEmail: settingsData.contactEmail || 'hello@hyrnex.com',
        contactPhone: settingsData.contactPhone || '+1 (555) 019-2834',
        address: settingsData.address || '100 Pine Street, San Francisco, CA 94111',
        linkedinUrl: settingsData.linkedinUrl || 'https://linkedin.com/company/hyrnex',
        githubUrl: settingsData.githubUrl || 'https://github.com/hyrnex',
        twitterUrl: settingsData.twitterUrl || 'https://twitter.com/hyrnex',
        cloudinaryCloudName: settingsData.cloudinaryCloudName || '',
        cloudinaryUploadPreset: settingsData.cloudinaryUploadPreset || ''
      }
    });
    logger.info('Database', 'Global application settings updated successfully');
    return mapSettings(updated);
  }
}
