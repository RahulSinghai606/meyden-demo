# Meyden Backend

Complete Phase 1 backend infrastructure for the Meyden platform - a comprehensive solution for vendor management, community features, and AI readiness assessments.

## 🚀 Features

### ✅ Implemented Infrastructure
- **Complete Database Schema**: PostgreSQL with Prisma ORM including all required tables and relationships
- **Express.js Server**: Production-ready server with TypeScript
- **Security Middleware**: Helmet, CORS, rate limiting, input validation
- **Logging System**: Winston-based logging with file rotation
- **Error Handling**: Comprehensive error handling with custom error classes
- **API Structure**: Organized route structure for all modules
- **Environment Configuration**: Complete environment variable management
- **Audit Logging**: Request/response logging and security monitoring

### 🏗️ Database Schema
- **User Management**: Users, profiles, sessions, roles
- **Vendor System**: Vendors, services, certifications, reviews, ratings
- **Community Platform**: Posts, comments, categories, follows, reactions
- **AI Readiness**: Surveys, questions, responses, results, reports
- **Admin System**: Moderation logs, platform settings, analytics
- **Communication**: Messages, notifications, email logs
- **Media Management**: File upload and storage system

### 🛡️ Security Features
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- Comprehensive audit logging
- Request ID tracking

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + OAuth 2.0 (Google, Microsoft)
- **File Storage**: AWS S3 SDK
- **Email**: AWS SES integration
- **Validation**: Joi/Zod for API validation
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston with file rotation

## 📋 API Endpoints

The backend provides the following API endpoints:

### Authentication (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh JWT tokens
- `GET /google` - Google OAuth initiation
- `GET /google/callback` - Google OAuth callback
- `GET /microsoft` - Microsoft OAuth initiation
- `GET /microsoft/callback` - Microsoft OAuth callback
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset confirmation
- `POST /verify-email` - Email verification

### User Management (`/api/v1/users`)
- `GET /` - Get user profile
- `PUT /profile` - Update user profile
- `GET /preferences` - Get user preferences
- `PUT /preferences` - Update user preferences

### Vendor Management (`/api/v1/vendors`)
- `GET /` - List vendors
- `GET /search` - Search and filter vendors
- `GET /:id` - Get vendor details
- `GET /:id/reviews` - Get vendor reviews

### Community Platform (`/api/v1/community`)
- `GET /posts` - Get community posts
- `GET /comments` - Get comments
- `GET /categories` - Get categories

### AI Readiness (`/api/v1/ai-readiness`)
- `GET /surveys` - Get available surveys
- `POST /assessments` - Submit assessment responses
- `GET /results` - Get assessment results

### Admin (`/api/v1/admin`)
- `GET /users` - Admin user management
- `GET /vendors` - Admin vendor management
- `GET /analytics` - Platform analytics
- `GET /settings` - Platform settings

### File Upload (`/api/v1/upload`)
- `POST /image` - Upload image files
- `POST /document` - Upload documents
- `DELETE /:id` - Delete uploaded files

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb meyden_db
   
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # (Optional) Seed database with sample data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

### Environment Variables

Key environment variables to configure:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/meyden_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# AWS (for S3 and SES)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
S3_BUCKET_NAME="meyden-files"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"

# Email (SMTP alternative)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Database connection
│   │   └── environment.ts # Environment configuration
│   ├── middleware/       # Custom middleware
│   │   ├── auditLogger.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/           # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── vendor.routes.ts
│   │   ├── community.routes.ts
│   │   ├── ai-readiness.routes.ts
│   │   ├── admin.routes.ts
│   │   └── upload.routes.ts
│   ├── utils/            # Utility functions
│   │   └── logger.ts     # Winston logger setup
│   ├── app.ts            # Express app configuration
│   └── server.ts         # Server entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── .env.example          # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🏗️ Database Schema

The database includes comprehensive schema for:

### User Management
- **Users**: Authentication and basic user information
- **Profiles**: Detailed user profile information
- **Sessions**: JWT session management
- **Roles**: User role-based access control

### Vendor System
- **Vendors**: Vendor business information
- **VendorServices**: Services offered by vendors
- **Certifications**: Vendor certifications and credentials
- **Reviews**: Customer reviews and ratings
- **PortfolioItems**: Vendor portfolio showcase

### Community Platform
- **Posts**: Community posts and discussions
- **Comments**: Post comments and replies
- **Categories**: Content categorization
- **Follows**: User following relationships
- **Reactions**: Post and comment reactions

### AI Readiness
- **Surveys**: Assessment surveys
- **Questions**: Survey questions with various types
- **SurveyResponses**: User assessment responses
- **QuestionResponses**: Individual question responses
- **AssessmentResults**: Calculated assessment results

### Admin System
- **ModerationLogs**: Content moderation tracking
- **PlatformSettings**: System configuration
- **AnalyticsEvents**: User behavior analytics

### Communication
- **Messages**: User messaging system
- **Notifications**: In-app notifications
- **EmailLogs**: Email delivery tracking

### Media Management
- **Media**: File upload and management

## 🔐 Security Implementation

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS**: Configured for cross-origin requests
- **Helmet**: Security headers protection
- **Audit Logging**: Complete request/response logging
- **SQL Injection Prevention**: Using Prisma ORM

## 📈 Performance & Monitoring

- **Compression**: Gzip compression for responses
- **Logging**: Structured logging with Winston
- **Health Checks**: `/health` endpoint for monitoring
- **Error Handling**: Comprehensive error handling
- **Request Tracking**: Unique request IDs for tracing

## 🚦 Status

### ✅ Phase 1A: Backend Foundation (COMPLETED)
- ✅ Database schema with all relationships
- ✅ Express.js server setup with TypeScript
- ✅ Security middleware and configuration
- ✅ API route structure
- ✅ Error handling and validation
- ✅ Environment configuration
- ✅ Logging and audit systems

### 🔄 Next Steps (Phase 1B)
- [ ] Complete authentication implementation
- [ ] Build all CRUD APIs with full functionality
- [ ] Implement file upload system with AWS S3
- [ ] Add email system with AWS SES
- [ ] Complete all API endpoints with proper validation
- [ ] Add comprehensive testing
- [ ] Generate API documentation
- [ ] Performance optimization

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Add logging for critical operations
5. Update tests for new features
6. Follow TypeScript best practices

## 📄 License

MIT License - see LICENSE file for details.

---

**Note**: This is Phase 1A of the Meyden backend implementation. The basic infrastructure is complete and ready for Phase 1B development which will implement the full API functionality.