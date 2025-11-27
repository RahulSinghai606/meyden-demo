import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

async function main() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Clear existing data in reverse order of dependencies
    await prisma.questionResponse.deleteMany();
    await prisma.surveyResponse.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.question.deleteMany();
    await prisma.survey.deleteMany();
    await prisma.review.deleteMany();
    await prisma.vendorService.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.category.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.notification.deleteMany();

    logger.info('🗑️  Cleared existing data');

    // Create categories
    const categories = await prisma.category.createMany({
      data: [
        { name: 'Government AI', slug: 'government-ai', description: 'AI implementations in government sectors' },
        { name: 'Data Governance', slug: 'data-governance', description: 'Data management and governance' },
        { name: 'AI Readiness', slug: 'ai-readiness', description: 'AI readiness assessments and strategies' },
        { name: 'Case Studies', slug: 'case-studies', description: 'Real-world AI implementation case studies' },
        { name: 'Technology Trends', slug: 'technology-trends', description: 'Latest AI and technology trends' },
        { name: 'Best Practices', slug: 'best-practices', description: 'AI implementation best practices' },
      ],
    });
    logger.info('📂 Created categories');

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@meyden.com',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });
    logger.info('👤 Created admin user');

    // Create vendor user
    const vendorPassword = await hashPassword('vendor123');
    const vendorUser = await prisma.user.create({
      data: {
        email: 'vendor@meyden.com',
        passwordHash: vendorPassword,
        firstName: 'Ahmed',
        lastName: 'Al-Rashid',
        role: 'VENDOR',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });
    logger.info('🏢 Created vendor user');

    // Create regular user
    const userPassword = await hashPassword('user123');
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@meyden.com',
        passwordHash: userPassword,
        firstName: 'Layla',
        lastName: 'Ibrahim',
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });
    logger.info('👥 Created regular user');

    // Create profiles
    await prisma.profile.create({
      data: {
        userId: vendorUser.id,
        bio: 'Experienced AI consultant with 12+ years in digital transformation',
        jobTitle: 'CEO & Founder',
        company: 'TechVision Solutions',
        industry: 'Technology Consulting',
        experienceYears: 12,
        country: 'UAE',
        city: 'Dubai',
        linkedin: 'https://linkedin.com/in/ahmedalrashid',
      },
    });

    await prisma.profile.create({
      data: {
        userId: regularUser.id,
        bio: 'Educational technology specialist interested in AI readiness',
        jobTitle: 'Educational Technology Specialist',
        company: 'Dubai Education Council',
        industry: 'Education',
        experienceYears: 5,
        country: 'UAE',
        city: 'Dubai',
      },
    });
    logger.info('👤 Created user profiles');

    // Create vendors
    const vendor1 = await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        companyName: 'TechVision Solutions',
        businessName: 'TechVision Solutions LLC',
        description: 'Leading AI and digital transformation consultancy helping enterprises achieve operational excellence through cutting-edge technology solutions.',
        email: 'contact@techvision.ae',
        phone: '+971-4-123-4567',
        address: 'Dubai Internet City',
        city: 'Dubai',
        state: 'Dubai',
        country: 'UAE',
        businessType: 'Technology Consulting',
        yearEstablished: 2012,
        employeeCount: '51-200',
        website: 'www.techvision.ae',
        status: 'ACTIVE',
        averageRating: 4.8,
        totalReviews: 127,
      },
    });

    const vendor2 = await prisma.vendor.create({
      data: {
        companyName: 'Emirates Data Systems',
        businessName: 'Emirates Data Systems LLC',
        description: 'Specialized data engineering and analytics firm with deep expertise in Middle East market requirements and compliance.',
        email: 'info@emiratesdata.ae',
        phone: '+971-2-987-6543',
        address: 'Al Maryah Island',
        city: 'Abu Dhabi',
        state: 'Abu Dhabi',
        country: 'UAE',
        businessType: 'Data Management',
        yearEstablished: 2016,
        employeeCount: '11-50',
        website: 'www.emiratesdata.ae',
        status: 'ACTIVE',
        averageRating: 4.9,
        totalReviews: 89,
      },
    });
    logger.info('🏢 Created vendors');

    // Create vendor services
    await prisma.vendorService.createMany({
      data: [
        {
          vendorId: vendor1.id,
          name: 'AI Strategy Consulting',
          description: 'Comprehensive AI strategy development and roadmap creation',
          category: 'CONSULTING',
          subcategory: 'AI Strategy',
          basePrice: 150,
          priceUnit: 'per hour',
          isActive: true,
          isFeatured: true,
        },
        {
          vendorId: vendor1.id,
          name: 'Digital Transformation',
          description: 'End-to-end digital transformation services',
          category: 'SOFTWARE_DEVELOPMENT',
          subcategory: 'Digital Transformation',
          basePrice: 200,
          priceUnit: 'per hour',
          isActive: true,
        },
        {
          vendorId: vendor2.id,
          name: 'Data Engineering',
          description: 'Custom data pipeline development and optimization',
          category: 'DATA_ANALYTICS',
          subcategory: 'Data Engineering',
          basePrice: 180,
          priceUnit: 'per hour',
          isActive: true,
          isFeatured: true,
        },
      ],
    });
    logger.info('🛠️  Created vendor services');

    // Create reviews (simplified)
    await prisma.review.createMany({
      data: [
        {
          vendorId: vendor1.id,
          reviewerName: 'John Smith',
          reviewerEmail: 'john@company.com',
          title: 'Excellent AI Strategy Service',
          content: 'TechVision helped us develop a comprehensive AI strategy. Very professional and knowledgeable team.',
          overallRating: 5,
          qualityRating: 5,
          communicationRating: 5,
          timelinessRating: 4,
          valueRating: 5,
          status: 'APPROVED',
          isVerified: true,
          isPublic: true,
        },
        {
          vendorId: vendor2.id,
          reviewerName: 'Sarah Johnson',
          reviewerEmail: 'sarah@analytics.com',
          title: 'Outstanding Data Engineering',
          content: 'The data engineering team delivered beyond expectations. Great technical expertise and communication.',
          overallRating: 5,
          qualityRating: 5,
          communicationRating: 4,
          timelinessRating: 5,
          valueRating: 5,
          status: 'APPROVED',
          isVerified: true,
          isPublic: true,
        },
      ],
    });
    logger.info('⭐ Created reviews');

    // Create AI Readiness Survey
    const survey = await prisma.survey.create({
      data: {
        title: 'AI Readiness Assessment',
        description: 'Comprehensive assessment of your organization\'s readiness for AI adoption',
        status: 'ACTIVE',
        isPublic: true,
        category: 'General',
        publishedAt: new Date(),
      },
    });
    logger.info('📊 Created AI Readiness survey');

    // Create survey questions
    const questions = [
      // Data Dimension
      {
        surveyId: survey.id,
        text: 'How would you rate your organization\'s current data collection and storage practices?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'We have comprehensive data collection with proper storage and backup systems',
          'We have basic data collection with adequate storage solutions',
          'We have limited data collection and basic storage',
          'We lack structured data collection and storage systems'
        ]),
        order: 1,
        maxScore: 1,
        isRequired: true,
      },
      {
        surveyId: survey.id,
        text: 'What is your organization\'s approach to data quality and governance?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'We have established data quality processes and governance policies',
          'We have basic data quality checks and some governance practices',
          'We have minimal data quality processes',
          'We have not addressed data quality and governance'
        ]),
        order: 2,
        maxScore: 1,
        isRequired: true,
      },
      // Governance Dimension
      {
        surveyId: survey.id,
        text: 'Does your organization have clear AI governance policies and procedures?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'Yes, we have comprehensive AI governance frameworks',
          'We have basic AI governance policies in place',
          'We are developing AI governance policies',
          'No, we have not established AI governance'
        ]),
        order: 3,
        maxScore: 1,
        isRequired: true,
      },
      {
        surveyId: survey.id,
        text: 'How does your organization ensure ethical AI practices?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'We have robust ethical AI guidelines and oversight committees',
          'We have basic ethical AI guidelines',
          'We are developing ethical AI practices',
          'We have not addressed ethical AI considerations'
        ]),
        order: 4,
        maxScore: 1,
        isRequired: true,
      },
      // Data Dimension - Additional questions
      {
        surveyId: survey.id,
        text: 'How does your organization handle data security and privacy compliance?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'We have comprehensive data security measures with full compliance',
          'We have basic security measures and partial compliance',
          'We have minimal security measures in place',
          'We have not addressed data security and privacy'
        ]),
        order: 3,
        maxScore: 1,
        isRequired: true,
      },
      // Governance Dimension
      {
        surveyId: survey.id,
        text: 'How would you describe your organization\'s culture towards AI adoption?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'We have a strong AI-first culture with active experimentation',
          'We have a positive attitude towards AI with selective adoption',
          'We are cautious about AI adoption but open to learning',
          'We have resistance to AI adoption across the organization'
        ]),
        order: 4,
        maxScore: 1,
        isRequired: true,
      },
      {
        surveyId: survey.id,
        text: 'What is your organization\'s approach to AI skills development and training?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'We have comprehensive AI training programs for all employees',
          'We have AI training programs for key personnel',
          'We have limited AI training and development opportunities',
          'We have not established AI training programs'
        ]),
        order: 5,
        maxScore: 1,
        isRequired: true,
      },
      {
        surveyId: survey.id,
        text: 'How does your organization approach change management for AI initiatives?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'We have structured change management processes for all AI projects',
          'We have basic change management approaches',
          'We have limited change management practices',
          'We have not established change management for AI'
        ]),
        order: 6,
        maxScore: 1,
        isRequired: true,
      },
      // Adoption Dimension
      {
        surveyId: survey.id,
        text: 'What is your organization\'s strategy for AI innovation and experimentation?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'We have dedicated AI innovation labs and regular experimentation',
          'We have occasional AI pilot projects and experimentation',
          'We have limited AI experimentation activities',
          'We have not established AI innovation programs'
        ]),
        order: 7,
        maxScore: 1,
        isRequired: true,
      },
      {
        surveyId: survey.id,
        text: 'How does your organization measure and track AI adoption success?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'We have comprehensive AI success metrics and KPIs',
          'We have basic AI success measurement processes',
          'We have limited AI success tracking',
          'We have not established AI success measurement'
        ]),
        order: 8,
        maxScore: 1,
        isRequired: true,
      },
      {
        surveyId: survey.id,
        text: 'What is your organization\'s approach to AI vendor selection and management?',
        type: 'SINGLE_CHOICE',
        options: JSON.stringify([
          'We have structured AI vendor evaluation and management processes',
          'We have basic AI vendor selection criteria',
          'We have limited AI vendor management practices',
          'We have not established AI vendor management'
        ]),
        order: 9,
        maxScore: 1,
        isRequired: true,
      },
    ];

    await prisma.question.createMany({
      data: questions,
    });
    logger.info('❓ Created survey questions');

    // Create community posts
    const post1 = await prisma.post.create({
      data: {
        userId: vendorUser.id,
        title: 'Best practices for AI implementation in government sectors',
        content: 'I\'ve been working on AI projects for government clients and wanted to share some insights about the unique challenges and opportunities in this space. The key is to start with small, manageable projects that demonstrate clear value...',
        type: 'ARTICLE',
        status: 'PUBLISHED',
        categoryId: (await prisma.category.findFirst({ where: { slug: 'government-ai' } }))?.id,
        publishedAt: new Date(),
        tags: 'government,AI,best-practices',
        slug: 'best-practices-ai-government',
        viewCount: 45,
        likeCount: 12,
      },
    });

    const post2 = await prisma.post.create({
      data: {
        userId: regularUser.id,
        title: 'AI Readiness Assessment - What should we focus on first?',
        content: 'We\'re planning to conduct an AI readiness assessment for our organization. What dimensions should we prioritize and what tools do you recommend for getting started?',
        type: 'QUESTION',
        status: 'PUBLISHED',
        categoryId: (await prisma.category.findFirst({ where: { slug: 'ai-readiness' } }))?.id,
        publishedAt: new Date(),
        tags: 'assessment,readiness,planning',
        slug: 'ai-readiness-what-to-focus',
        viewCount: 23,
        likeCount: 8,
      },
    });
    logger.info('📝 Created community posts');

    // Create comments
    await prisma.comment.create({
      data: {
        userId: regularUser.id,
        postId: post1.id,
        content: 'Great insights! Could you elaborate on the compliance considerations for government AI projects?',
        status: 'PUBLISHED',
      },
    });

    await prisma.comment.create({
      data: {
        userId: vendorUser.id,
        postId: post2.id,
        content: 'I recommend starting with data governance and then moving to pilot projects. The AI readiness survey on this platform is a great starting point!',
        status: 'PUBLISHED',
      },
    });
    logger.info('💬 Created comments');

    // Update post comment counts
    await prisma.post.update({
      where: { id: post1.id },
      data: { commentCount: 1 },
    });

    await prisma.post.update({
      where: { id: post2.id },
      data: { commentCount: 1 },
    });

    logger.info('✅ Database seeding completed successfully!');
    console.log('\n🎉 Seeding completed!');
    console.log('\n📧 Demo accounts created:');
    console.log('   Admin: admin@meyden.com / admin123');
    console.log('   Vendor: vendor@meyden.com / vendor123');
    console.log('   User: user@meyden.com / user123');
    console.log('\n🏢 Sample vendors created:');
    console.log('   - TechVision Solutions (Dubai)');
    console.log('   - Emirates Data Systems (Abu Dhabi)');
    console.log('\n📊 AI Readiness Survey created with 9 questions');
    console.log('📝 Community posts and comments created');

  } catch (error) {
    logger.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });