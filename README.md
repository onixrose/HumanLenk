# HumanLenk MVP - Premium PWA with GPT-Powered Chat

A production-ready Progressive Web App (PWA) with AI-powered chat functionality, intelligent file processing, and comprehensive admin management.

## 🚀 Features

### Core Features
- **AI-Powered Chat**: GPT integration for summarizing, editing, and clarifying content
- **File Processing**: Upload and analyze PDF, DOCX, and TXT files
- **Progressive Web App**: Installable on mobile and desktop with offline support
- **Real-time Messaging**: Streaming chat responses with message history
- **User Authentication**: Secure JWT-based authentication with role management

### Admin Features
- **User Management**: View, manage, and analyze user accounts
- **File Management**: Monitor file uploads, processing status, and storage
- **Analytics Dashboard**: Comprehensive statistics and insights
- **Survey Collection**: Gather user feedback and ratings
- **Role-based Access**: Admin-only features with proper security

### Technical Features
- **Performance Optimized**: Sub-2-second load times with caching
- **Mobile-First Design**: Responsive design with premium UI/UX
- **Security**: Comprehensive security headers and input validation
- **Scalable Architecture**: AWS-ready with auto-scaling capabilities
- **CI/CD Pipeline**: Automated testing, building, and deployment

## 🏗️ Architecture

### Monorepo Structure
```
humanlenk/
├── apps/
│   ├── frontend/          # Next.js 14 PWA
│   └── backend/           # Express.js API
├── packages/
│   ├── types/             # Shared TypeScript types
│   ├── api-client/        # React Query hooks
│   ├── utils/             # Shared utilities
│   └── ui/                # Reusable UI components
├── .github/workflows/     # CI/CD pipelines
└── docs/                  # Documentation
```

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **AI Integration**: OpenAI GPT API
- **File Storage**: AWS S3
- **Authentication**: JWT with bcrypt
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: AWS (S3, CloudFront, Elastic Beanstalk)
- **CI/CD**: GitHub Actions
- **Monitoring**: Winston logging, Lighthouse CI

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Yarn 1.22+
- PostgreSQL 15+
- AWS Account (for file storage)
- OpenAI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ronniexy/HumanLenk.git
   cd HumanLenk
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp apps/backend/env.example apps/backend/.env
   cp env.example .env
   
   # Edit the files with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   yarn db:generate
   
   # Run database migrations
   yarn db:migrate
   
   # (Optional) Open Prisma Studio
   yarn db:studio
   ```

5. **Start development servers**
   ```bash
   # Start both frontend and backend
   yarn dev
   
   # Or start individually
   yarn start:frontend  # http://localhost:3000
   yarn start:backend   # http://localhost:3001
   ```

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/humanlenk"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# AWS Configuration
AWS_S3_BUCKET="humanlenk-files"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"

# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key"

# Server Configuration
PORT=3001
NODE_ENV="development"
LOG_LEVEL="info"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 📱 Usage

### For Users
1. **Sign Up/Login**: Create an account or sign in
2. **Chat**: Start conversations with the AI assistant
3. **Upload Files**: Drag and drop PDF, DOCX, or TXT files
4. **Get AI Help**: Ask questions about uploaded files
5. **Provide Feedback**: Rate your experience and leave feedback

### For Admins
1. **Access Admin Panel**: Click "Admin" button in header (admin users only)
2. **Monitor Users**: View user statistics and manage accounts
3. **Track Files**: Monitor file uploads and processing status
4. **Analyze Feedback**: Review user surveys and ratings
5. **View Analytics**: Access comprehensive dashboard metrics

## 🚀 Deployment

### AWS Deployment

#### Frontend (S3 + CloudFront)
```bash
# Build the frontend
cd apps/frontend
yarn build

# Deploy to S3
aws s3 sync out/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### Backend (Elastic Beanstalk)
```bash
# Build the backend
cd apps/backend
yarn build

# Create deployment package
zip -r ../backend-deployment.zip . -x "node_modules/*" "src/*" "*.ts"

# Deploy to Elastic Beanstalk
eb deploy
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual services
docker build -f apps/frontend/Dockerfile -t humanlenk-frontend .
docker build -f apps/backend/Dockerfile -t humanlenk-backend .
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
yarn test

# Run frontend tests
cd apps/frontend && yarn test

# Run backend tests
cd apps/backend && yarn test
```

### Performance Testing
```bash
# Run Lighthouse CI
yarn analyze

# Bundle analysis
cd apps/frontend && yarn analyze
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Lighthouse CI**: Automated performance testing
- **Bundle Analysis**: Webpack bundle size optimization
- **Core Web Vitals**: LCP, FID, CLS monitoring

### Application Monitoring
- **Winston Logging**: Structured logging with different levels
- **Error Tracking**: Comprehensive error handling and reporting
- **Database Monitoring**: Query performance and connection pooling

### User Analytics
- **Admin Dashboard**: Real-time user and file statistics
- **Survey Collection**: User feedback and satisfaction tracking
- **Usage Metrics**: File uploads, messages, and engagement

## 🔧 Scripts

### Development
```bash
yarn dev              # Start development servers
yarn build            # Build all packages
yarn lint             # Lint all code
yarn type-check       # TypeScript type checking
yarn format           # Format code with Prettier
```

### Database
```bash
yarn db:generate      # Generate Prisma client
yarn db:migrate       # Run database migrations
yarn db:push          # Push schema changes
yarn db:studio        # Open Prisma Studio
```

### Production
```bash
yarn start:frontend   # Start production frontend
yarn start:backend    # Start production backend
yarn audit            # Security audit
```

## 🛡️ Security

### Implemented Security Measures
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Zod schemas for all API inputs
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS Protection**: Configured for production domains
- **Security Headers**: Helmet.js for security headers
- **File Validation**: Strict file type and size limits
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers

### Security Best Practices
- Environment variables for sensitive data
- Regular dependency updates
- Security scanning in CI/CD
- Role-based access control
- Audit logging for admin actions

## 🤝 Contributing

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "feat: your feature"`
3. Push to GitHub: `git push origin feature/your-feature`
4. Create a Pull Request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for changelog generation
- Test coverage for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Reset database
yarn db:push --force-reset
```

#### Build Issues
```bash
# Clear caches
yarn clean
rm -rf node_modules
yarn install
```

#### Environment Issues
```bash
# Verify environment variables
yarn db:generate  # Should work without errors
```

## 🎯 Roadmap

### Phase 1 (Current MVP)
- ✅ Core chat functionality
- ✅ File upload and processing
- ✅ User authentication
- ✅ Admin panel
- ✅ PWA features

### Phase 2 (Future Enhancements)
- [ ] Advanced AI models integration
- [ ] Real-time collaboration features
- [ ] Advanced file processing (OCR, image analysis)
- [ ] Mobile app (React Native)
- [ ] Enterprise features (SSO, advanced admin tools)

### Phase 3 (Scale)
- [ ] Multi-tenant architecture
- [ ] Advanced analytics and reporting
- [ ] API marketplace
- [ ] Third-party integrations
- [ ] White-label solutions

---

**Built with ❤️ for the HumanLenk MVP project**

For more information, visit our [GitHub repository](https://github.com/ronniexy/HumanLenk) or contact the development team.
