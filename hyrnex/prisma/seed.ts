import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

async function main() {
  console.log('Seeding Hyrnex production database...');

  // Reset collections
  await prisma.settings.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.admin.deleteMany({});

  // 1. Seed Settings
  const settings = await prisma.settings.create({
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
  console.log('Seeded settings:', settings);

  // 2. Seed Admin
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@hyrnex.com',
      passwordHash: hashPassword('admin123'),
      name: 'Jayadev'
    }
  });
  console.log('Seeded admin:', admin);

  // 3. Seed Jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Senior Full Stack Engineer',
      company: 'Stripe',
      logo: 'S',
      country: 'United States',
      city: 'San Francisco, CA',
      salary: '$160,000 - $210,000',
      experience: 'Senior (5+ years)',
      category: 'Software Engineering',
      employmentType: 'Full-time',
      vacancies: 2,
      description: 'We are looking for a Senior Full Stack Engineer to help build the future of global economic infrastructure. In this role, you will work across our user-facing dashboards and backend transaction systems, design high-throughput APIs, and collaborate closely with product design and engineering teams.',
      responsibilities: 'Design, build, and maintain robust, scalable APIs and user-facing web applications.\nCollaborate with product managers and UI designers to craft seamless payment experiences.\nOptimize systems for performance, reliability, and security.\nMentor other engineers and establish best development practices.',
      requirements: '5+ years of experience building production-ready SaaS platforms.\nProficiency in React, TypeScript, Node.js, and relational databases (PostgreSQL/MySQL).\nStrong understanding of API design, microservices architecture, and cloud infrastructure.\nPassion for robust software design and exceptional user experience.',
      benefits: 'Competitive equity and salary packages.\nComprehensive premium health, dental, and vision insurance.\nFlexible work arrangement with hybrid option.\nHome office stipend and continuous learning budget.',
      featured: true,
      urgent: true,
      publishedDate: '2026-07-01',
      expiryDate: '2026-09-01',
      status: 'published'
    }
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Product Designer',
      company: 'Linear',
      logo: 'L',
      country: 'Remote',
      city: 'Worldwide',
      salary: '$120,000 - $160,000',
      experience: 'Mid-Senior (3+ years)',
      category: 'Design',
      employmentType: 'Full-time',
      vacancies: 1,
      description: 'Linear is looking for a Product Designer who has a strong obsession with tools, details, and software craftsmanship. You will be responsible for defining the user experience, interaction flows, and visual language of our issue tracking and project management tools.',
      responsibilities: 'Translate complex workflows into simple, elegant, and highly efficient user interfaces.\nProduce high-fidelity mockups, interactive prototypes, and custom motion visual assets.\nConduct customer interviews and user testing sessions to gather rich insights.\nCollaborate closely with frontend engineers to ensure design implementation is pixel-perfect.',
      requirements: '3+ years of experience designing complex, professional web applications.\nOutstanding portfolio demonstrating exceptional visual craftsmanship, typography, and motion design.\nStrong proficiency in Figma and prototyping tools.\nBasic understanding of HTML, CSS, and modern frontend frameworks is a huge plus.',
      benefits: 'Unlimited vacation and generous wellness allowance.\nTop-of-the-line hardware and workspace budget.\nFlexible working hours and absolute remote autonomy.\nAnnual team retreats in inspiring locations.',
      featured: true,
      urgent: false,
      publishedDate: '2026-07-03',
      expiryDate: '2026-08-31',
      status: 'published'
    }
  });

  console.log('Seeded jobs');

  // 5. Seed Blogs
  await prisma.blog.create({
    data: {
      title: 'How to Build a Standout Software Engineering Portfolio in 2026',
      slug: 'build-standout-engineering-portfolio-2026',
      content: 'In 2026, the software engineering market is more competitive than ever. Simple todo list applications or clone tutorials are no longer sufficient to capture the attention of technical recruiters at premium startups.\n\nTo build a standout portfolio, focus on architectural honesty, production deployment, and real-world usefulness:\n\n### 1. Build a Complete End-to-End Application\nInstead of simple front-end designs, build full-stack tools. Make sure your projects include persistent database layers, secure user authentication, responsive layouts, and clean API routing. Deploy your applications to production and ensure they perform beautifully on ultra-wide monitors and mobile devices.',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800',
      seo: 'Learn how to build a world-class software engineering portfolio that lands jobs at top startups like Stripe, Linear, and Vercel.',
      readingTime: '4 min read',
      draft: false
    }
  });

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
