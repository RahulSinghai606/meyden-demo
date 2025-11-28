// Mock data for Meyden Demo

export interface Vendor {
  id: string;
  name: string;
  industry: string;
  tier: 'Premium' | 'Standard' | 'Basic';
  rating: number;
  reviewCount: number;
  description: string;
  services: string[];
  location: string;
  yearsInBusiness: number;
  employees: number;
  logo?: string;
  coverImage?: string;
  specialties: string[];
  certifications: string[];
  contactEmail: string;
  contactPhone: string;
  website: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendor' | 'learner' | 'guest';
  avatar?: string;
  joinDate: string;
  company?: string;
  title?: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  category: string;
  likes: number;
  replies: number;
  timestamp: string;
  isFollowing?: boolean;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  dimension: 'Data' | 'Governance' | 'Adoption';
  options: string[];
}

export const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'TechVision Solutions',
    industry: 'Technology Consulting',
    tier: 'Premium',
    rating: 4.8,
    reviewCount: 127,
    description: 'Leading AI and digital transformation consultancy helping enterprises achieve operational excellence through cutting-edge technology solutions.',
    services: ['AI Strategy', 'Digital Transformation', 'Cloud Migration', 'Data Analytics'],
    location: 'Dubai, UAE',
    yearsInBusiness: 12,
    employees: 150,
    specialties: ['Machine Learning', 'Natural Language Processing', 'Computer Vision'],
    certifications: ['AWS Partner', 'Microsoft Gold Partner', 'ISO 27001'],
    contactEmail: 'contact@techvision.ae',
    contactPhone: '+971-4-123-4567',
    website: 'www.techvision.ae'
  },
  {
    id: '2',
    name: 'Emirates Data Systems',
    industry: 'Data Management',
    tier: 'Premium',
    rating: 4.9,
    reviewCount: 89,
    description: 'Specialized data engineering and analytics firm with deep expertise in Middle East market requirements and compliance.',
    services: ['Data Engineering', 'Business Intelligence', 'Data Warehousing', 'Real-time Analytics'],
    location: 'Abu Dhabi, UAE',
    yearsInBusiness: 8,
    employees: 75,
    specialties: ['Big Data', 'ETL Pipelines', 'Dashboard Development'],
    certifications: ['Google Cloud Partner', 'Snowflake Partner'],
    contactEmail: 'info@emiratesdata.ae',
    contactPhone: '+971-2-987-6543',
    website: 'www.emiratesdata.ae'
  },
  {
    id: '3',
    name: 'Gulf AI Innovators',
    industry: 'AI Development',
    tier: 'Standard',
    rating: 4.6,
    reviewCount: 156,
    description: 'Innovative AI development company focused on creating custom solutions for regional businesses and government entities.',
    services: ['Custom AI Models', 'Chatbots', 'Predictive Analytics', 'Process Automation'],
    location: 'Riyadh, Saudi Arabia',
    yearsInBusiness: 6,
    employees: 45,
    specialties: ['NLP', 'Computer Vision', 'Automation'],
    certifications: ['NVIDIA Partner', 'Intel AI Partner'],
    contactEmail: 'hello@gulfai.sa',
    contactPhone: '+966-11-456-7890',
    website: 'www.gulfai.sa'
  },
  {
    id: '4',
    name: 'Smart City Technologies',
    industry: 'IoT & Smart Cities',
    tier: 'Premium',
    rating: 4.7,
    reviewCount: 203,
    description: 'Pioneering smart city solutions and IoT platforms for urban development and municipal services optimization.',
    services: ['IoT Solutions', 'Smart Infrastructure', 'Urban Analytics', 'Environmental Monitoring'],
    location: 'Doha, Qatar',
    yearsInBusiness: 10,
    employees: 120,
    specialties: ['IoT Platforms', 'Smart Sensors', 'Urban Planning'],
    certifications: ['LoRa Alliance', 'GSMA Member'],
    contactEmail: 'solutions@smartcity.qa',
    contactPhone: '+974-4-567-8901',
    website: 'www.smartcity.qa'
  },
  {
    id: '5',
    name: 'Desert Digital Agency',
    industry: 'Digital Marketing',
    tier: 'Standard',
    rating: 4.5,
    reviewCount: 94,
    description: 'Full-service digital agency specializing in AI-powered marketing automation and customer engagement solutions.',
    services: ['Marketing Automation', 'CRM Integration', 'Lead Generation', 'Content Strategy'],
    location: 'Kuwait City, Kuwait',
    yearsInBusiness: 7,
    employees: 32,
    specialties: ['Marketing AI', 'CRM Solutions', 'Lead Scoring'],
    certifications: ['Salesforce Partner', 'HubSpot Partner'],
    contactEmail: 'team@desertdigital.kw',
    contactPhone: '+965-6-234-5678',
    website: 'www.desertdigital.kw'
  },
  {
    id: '6',
    name: 'Innovation Labs MENA',
    industry: 'Research & Development',
    tier: 'Premium',
    rating: 4.8,
    reviewCount: 67,
    description: 'Cutting-edge R&D firm focused on emerging technologies including quantum computing, blockchain, and advanced AI.',
    services: ['Research & Development', 'Proof of Concept', 'Technology Assessment', 'Innovation Strategy'],
    location: 'Bahrain',
    yearsInBusiness: 9,
    employees: 85,
    specialties: ['Quantum Computing', 'Blockchain', 'Advanced AI'],
    certifications: ['MIT Industry Liaison', 'Stanford Partner'],
    contactEmail: 'research@innovationlabs.bh',
    contactPhone: '+973-17-345-6789',
    website: 'www.innovationlabs.bh'
  },
  {
    id: '7',
    name: 'Healthcare AI Solutions',
    industry: 'Healthcare Technology',
    tier: 'Standard',
    rating: 4.6,
    reviewCount: 112,
    description: 'Specialized healthcare AI solutions provider focusing on medical imaging, patient care optimization, and clinical decision support.',
    services: ['Medical Imaging AI', 'Patient Analytics', 'Clinical Decision Support', 'Telemedicine'],
    location: 'Cairo, Egypt',
    yearsInBusiness: 5,
    employees: 38,
    specialties: ['Medical Imaging', 'Healthcare Analytics', 'Clinical AI'],
    certifications: ['HIPAA Compliant', 'FDA Approved Solutions'],
    contactEmail: 'health@ai-solutions.eg',
    contactPhone: '+20-2-456-7890',
    website: 'www.ai-solutions.eg'
  },
  {
    id: '8',
    name: 'FinanceTech Innovations',
    industry: 'FinTech',
    tier: 'Premium',
    rating: 4.9,
    reviewCount: 178,
    description: 'Leading financial technology company providing AI-powered solutions for banking, payments, and risk management.',
    services: ['Risk Analytics', 'Fraud Detection', 'Regulatory Compliance', 'Payment Solutions'],
    location: 'Dubai International Financial Centre',
    yearsInBusiness: 11,
    employees: 200,
    specialties: ['Risk Modeling', 'Fraud Detection', 'RegTech'],
    certifications: ['ISO 20022', 'PCI DSS Level 1'],
    contactEmail: 'info@financetech.ae',
    contactPhone: '+971-4-789-0123',
    website: 'www.financetech.ae'
  },
  {
    id: '9',
    name: 'Supply Chain Optimizers',
    industry: 'Logistics & Supply Chain',
    tier: 'Standard',
    rating: 4.4,
    reviewCount: 85,
    description: 'AI-driven supply chain optimization platform helping businesses reduce costs and improve efficiency across MENA region.',
    services: ['Supply Chain Analytics', 'Demand Forecasting', 'Inventory Optimization', 'Route Planning'],
    location: 'Jeddah, Saudi Arabia',
    yearsInBusiness: 4,
    employees: 28,
    specialties: ['Logistics AI', 'Demand Planning', 'Supply Optimization'],
    certifications: ['APICS Member', 'ISO 9001'],
    contactEmail: 'optimize@supplychain.sa',
    contactPhone: '+966-12-345-6789',
    website: 'www.supplychain.sa'
  },
  {
    id: '10',
    name: 'Education Technology Hub',
    industry: 'EdTech',
    tier: 'Basic',
    rating: 4.3,
    reviewCount: 143,
    description: 'Innovative educational technology platform using AI to personalize learning experiences and improve educational outcomes.',
    services: ['Learning Management Systems', 'Adaptive Learning', 'Student Analytics', 'Virtual Classrooms'],
    location: 'Amman, Jordan',
    yearsInBusiness: 6,
    employees: 42,
    specialties: ['Adaptive Learning', 'Student Assessment', 'Virtual Education'],
    certifications: ['WCAG 2.1 AA', 'FERPA Compliant'],
    contactEmail: 'learn@edtech.jo',
    contactPhone: '+962-6-789-0123',
    website: 'www.edtech.jo'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ahmed Al-Rashid',
    email: 'vendor@meyden.com',
    role: 'vendor',
    joinDate: '2023-01-15',
    company: 'TechVision Solutions',
    title: 'CEO & Founder'
  },
  {
    id: '2',
    name: 'Fatima Al-Zahra',
    email: 'fatima@emiratesdata.ae',
    role: 'vendor',
    joinDate: '2023-03-22',
    company: 'Emirates Data Systems',
    title: 'Chief Data Officer'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@meyden.com',
    role: 'admin',
    joinDate: '2022-11-10',
    company: 'Meyden Platform',
    title: 'Platform Administrator'
  },
  {
    id: '4',
    name: 'Layla Ibrahim',
    email: 'user@meyden.com',
    role: 'learner',
    joinDate: '2023-06-05',
    company: 'Dubai Education Council',
    title: 'Educational Technology Specialist'
  }
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    title: 'Best practices for AI implementation in government sectors',
    content: 'I\'ve been working on AI projects for government clients and wanted to share some insights about the unique challenges and opportunities...',
    author: 'Ahmed Al-Rashid',
    authorRole: 'Vendor',
    category: 'Government AI',
    likes: 23,
    replies: 8,
    timestamp: '2 hours ago',
    isFollowing: true
  },
  {
    id: '2',
    title: 'Data governance frameworks for the MENA region',
    content: 'As we expand our operations across MENA, I\'m curious about what frameworks others are using for data governance and compliance...',
    author: 'Fatima Al-Zahra',
    authorRole: 'Vendor',
    category: 'Data Governance',
    likes: 31,
    replies: 12,
    timestamp: '5 hours ago',
    isFollowing: false
  },
  {
    id: '3',
    title: 'AI Readiness Assessment - What should we focus on first?',
    content: 'We\'re planning to conduct an AI readiness assessment for our organization. What dimensions should we prioritize and what tools do you recommend?',
    author: 'Layla Ibrahim',
    authorRole: 'Learner',
    category: 'AI Readiness',
    likes: 18,
    replies: 6,
    timestamp: '1 day ago',
    isFollowing: true
  },
  {
    id: '4',
    title: 'Success story: Digital transformation in Dubai Municipality',
    content: 'I wanted to share our recent success with implementing AI-powered systems across Dubai Municipality operations...',
    author: 'Omar Hassan',
    authorRole: 'Admin',
    category: 'Case Studies',
    likes: 45,
    replies: 15,
    timestamp: '2 days ago',
    isFollowing: true
  }
];

export const mockSurveyQuestions: SurveyQuestion[] = [
  // Data Dimension
  {
    id: '1',
    question: 'How would you rate your organization\'s current data collection and storage practices?',
    dimension: 'Data',
    options: [
      'We have comprehensive data collection with proper storage and backup systems',
      'We have basic data collection with adequate storage solutions',
      'We have limited data collection and basic storage',
      'We lack structured data collection and storage systems'
    ]
  },
  {
    id: '2',
    question: 'What is your organization\'s approach to data quality and governance?',
    dimension: 'Data',
    options: [
      'We have established data quality processes and governance policies',
      'We have basic data quality checks and some governance practices',
      'We have minimal data quality processes',
      'We have not addressed data quality and governance'
    ]
  },
  {
    id: '3',
    question: 'How does your organization handle data integration from multiple sources?',
    dimension: 'Data',
    options: [
      'We have sophisticated data integration platforms and processes',
      'We have basic data integration capabilities',
      'We manually integrate data from different sources',
      'We struggle with data integration across systems'
    ]
  },
  
  // Governance Dimension
  {
    id: '4',
    question: 'Does your organization have clear AI governance policies and procedures?',
    dimension: 'Governance',
    options: [
      'Yes, we have comprehensive AI governance frameworks',
      'We have basic AI governance policies in place',
      'We are developing AI governance policies',
      'No, we have not established AI governance'
    ]
  },
  {
    id: '5',
    question: 'How does your organization ensure ethical AI practices?',
    dimension: 'Governance',
    options: [
      'We have robust ethical AI guidelines and oversight committees',
      'We have basic ethical AI guidelines',
      'We are developing ethical AI practices',
      'We have not addressed ethical AI considerations'
    ]
  },
  {
    id: '6',
    question: 'What is your approach to AI risk management and compliance?',
    dimension: 'Governance',
    options: [
      'We have comprehensive AI risk management and compliance frameworks',
      'We have basic AI risk management processes',
      'We are developing AI risk management practices',
      'We have not established AI risk management'
    ]
  },
  
  // Adoption Dimension
  {
    id: '7',
    question: 'How would you describe your organization\'s culture towards AI adoption?',
    dimension: 'Adoption',
    options: [
      'We have a strong AI-first culture with active experimentation',
      'We have a positive attitude towards AI with selective adoption',
      'We are cautious about AI adoption but open to learning',
      'We have resistance to AI adoption across the organization'
    ]
  },
  {
    id: '8',
    question: 'What is your organization\'s approach to AI skills development and training?',
    dimension: 'Adoption',
    options: [
      'We have comprehensive AI training programs for all employees',
      'We have AI training programs for key personnel',
      'We have limited AI training and development opportunities',
      'We have not established AI training programs'
    ]
  },
  {
    id: '9',
    question: 'How does your organization measure and evaluate AI project success?',
    dimension: 'Adoption',
    options: [
      'We have sophisticated AI project evaluation and measurement frameworks',
      'We have basic AI project evaluation methods',
      'We are developing AI project evaluation practices',
      'We have not established AI project evaluation methods'
    ]
  }
];

export const mockAnalytics = {
  users: {
    total: 1247,
    vendors: 89,
    learners: 1045,
    admins: 3,
    growth: '+12.5%'
  },
  vendors: {
    total: 89,
    premium: 28,
    standard: 42,
    basic: 19,
    topIndustries: [
      { name: 'Technology Consulting', count: 15 },
      { name: 'FinTech', count: 12 },
      { name: 'Healthcare Technology', count: 9 },
      { name: 'Data Management', count: 8 },
      { name: 'EdTech', count: 7 }
    ]
  },
  engagement: {
    surveyCompletions: 234,
    communityPosts: 89,
    avgRating: 4.6,
    responseRate: '87%'
  },
  monthlyData: [
    { month: 'Jan', users: 850, vendors: 72, surveys: 156 },
    { month: 'Feb', users: 920, vendors: 78, surveys: 189 },
    { month: 'Mar', users: 1050, vendors: 82, surveys: 212 },
    { month: 'Apr', users: 1140, vendors: 85, surveys: 234 },
    { month: 'May', users: 1205, vendors: 87, surveys: 267 },
    { month: 'Jun', users: 1247, vendors: 89, surveys: 289 }
  ]
};

// Export common queries for the UI
export const getVendorsByIndustry = (industry: string) => 
  mockVendors.filter(vendor => vendor.industry === industry);

export const getVendorsByTier = (tier: string) => 
  mockVendors.filter(vendor => vendor.tier === tier);

export const searchVendors = (query: string) => 
  mockVendors.filter(vendor => 
    vendor.name.toLowerCase().includes(query.toLowerCase()) ||
    vendor.industry.toLowerCase().includes(query.toLowerCase()) ||
    vendor.services.some(service => service.toLowerCase().includes(query.toLowerCase()))
  );