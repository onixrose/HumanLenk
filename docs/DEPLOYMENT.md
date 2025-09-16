# Deployment Guide

This guide covers deploying HumanLenk to production environments.

## 🚀 Quick Start

### Prerequisites
- AWS Account with appropriate permissions
- Domain name (optional but recommended)
- SSL certificate (handled by CloudFront)
- Environment variables configured

### 1. AWS Infrastructure Setup

#### S3 Bucket for Frontend
```bash
# Create S3 bucket
aws s3 mb s3://humanlenk-frontend-prod

# Configure for static website hosting
aws s3 website s3://humanlenk-frontend-prod --index-document index.html --error-document 404.html

# Set bucket policy for CloudFront
aws s3api put-bucket-policy --bucket humanlenk-frontend-prod --policy file://bucket-policy.json
```

#### CloudFront Distribution
```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

#### RDS PostgreSQL Database
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier humanlenk-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx
```

#### Elastic Beanstalk Application
```bash
# Create Elastic Beanstalk application
eb init humanlenk-backend

# Create environment
eb create production
```

### 2. Environment Configuration

#### Production Environment Variables
```env
# Database
DATABASE_URL="postgresql://postgres:password@your-rds-endpoint:5432/humanlenk"

# Authentication
JWT_SECRET="your-production-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# AWS Configuration
AWS_S3_BUCKET="humanlenk-files-prod"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-production-access-key"
AWS_SECRET_ACCESS_KEY="your-production-secret-key"

# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key"

# Server Configuration
PORT=5000
NODE_ENV="production"
LOG_LEVEL="warn"

# Frontend URL
FRONTEND_URL="https://your-domain.com"
```

### 3. Database Setup

#### Run Migrations
```bash
# Set production database URL
export DATABASE_URL="postgresql://postgres:password@your-rds-endpoint:5432/humanlenk"

# Run migrations
yarn db:migrate

# Generate Prisma client
yarn db:generate
```

### 4. Frontend Deployment

#### Build and Deploy
```bash
# Build frontend
cd apps/frontend
yarn build

# Deploy to S3
aws s3 sync out/ s3://humanlenk-frontend-prod --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### 5. Backend Deployment

#### Deploy to Elastic Beanstalk
```bash
# Build backend
cd apps/backend
yarn build

# Create deployment package
zip -r ../backend-deployment.zip . \
  -x "node_modules/*" "src/*" "*.ts" "tsconfig.json" ".env*" "prisma/migrations/*"

# Deploy
eb deploy production
```

## 🔧 CI/CD Pipeline

### GitHub Actions Setup

#### Required Secrets
Add these secrets to your GitHub repository:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
S3_BUCKET_NAME
CLOUDFRONT_DISTRIBUTION_ID
EB_APPLICATION_NAME
EB_ENVIRONMENT_NAME
DATABASE_URL
NEXT_PUBLIC_API_URL
SNYK_TOKEN
```

#### Pipeline Features
- **Automatic Testing**: Lint, type check, and unit tests
- **Security Scanning**: Dependency audit and Snyk security scan
- **Performance Testing**: Lighthouse CI for performance metrics
- **Automated Deployment**: Deploy to staging and production
- **Rollback Capability**: Easy rollback to previous versions

### Manual Deployment

#### Frontend
```bash
# Build and deploy frontend
yarn build:frontend
aws s3 sync apps/frontend/out/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### Backend
```bash
# Build and deploy backend
yarn build:backend
eb deploy production
```

## 🐳 Docker Deployment

### Docker Compose Production
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: humanlenk
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/humanlenk
      JWT_SECRET: ${JWT_SECRET}
      AWS_S3_BUCKET: ${AWS_S3_BUCKET}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      - postgres
    ports:
      - "5000:5000"

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://backend:3001
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

### Deploy with Docker
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

## 📊 Monitoring & Logging

### Application Monitoring
- **Winston Logging**: Structured logs with different levels
- **Error Tracking**: Comprehensive error handling
- **Performance Metrics**: Response times and throughput
- **Health Checks**: `/health` endpoint for monitoring

### Infrastructure Monitoring
- **CloudWatch**: AWS service monitoring
- **RDS Monitoring**: Database performance metrics
- **S3 Monitoring**: Storage usage and access patterns
- **CloudFront Analytics**: CDN performance metrics

### Log Management
```bash
# View application logs
eb logs production

# View specific log streams
eb logs production --all

# Download logs
eb logs production --all --zip
```

## 🔒 Security Considerations

### Production Security Checklist
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] JWT secrets are strong and unique
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] SSL/TLS certificates valid
- [ ] Dependencies updated
- [ ] Security scanning enabled

### Security Headers
```javascript
// Next.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
psql -h your-rds-endpoint -U postgres -d humanlenk

# Test connection from application
yarn db:generate
```

#### Build Failures
```bash
# Clear caches and rebuild
yarn clean
rm -rf node_modules
yarn install
yarn build
```

#### Deployment Issues
```bash
# Check Elastic Beanstalk logs
eb logs production

# Verify environment variables
eb printenv production

# Restart application
eb restart production
```

#### Performance Issues
```bash
# Check CloudFront cache hit ratio
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Monitor RDS performance
aws rds describe-db-instances --db-instance-identifier humanlenk-prod
```

### Rollback Procedures

#### Frontend Rollback
```bash
# Deploy previous version
aws s3 sync s3://your-bucket-backup/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### Backend Rollback
```bash
# Deploy previous version
eb deploy production --version previous-version-label
```

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: WebP/AVIF format support
- **Caching**: Aggressive caching with service workers
- **CDN**: Global content delivery with CloudFront

### Backend Optimization
- **Connection Pooling**: Database connection optimization
- **Caching**: Redis for session and data caching
- **Compression**: Gzip compression for API responses
- **Load Balancing**: Multiple backend instances

### Database Optimization
- **Indexing**: Proper database indexes
- **Query Optimization**: Efficient Prisma queries
- **Connection Pooling**: Optimized connection management
- **Monitoring**: Query performance tracking

## 🔄 Backup & Recovery

### Database Backup
```bash
# Automated daily backups
aws rds create-db-snapshot \
  --db-instance-identifier humanlenk-prod \
  --db-snapshot-identifier humanlenk-backup-$(date +%Y%m%d)
```

### File Backup
```bash
# S3 cross-region replication
aws s3api put-bucket-replication \
  --bucket humanlenk-files-prod \
  --replication-configuration file://replication-config.json
```

### Recovery Procedures
```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier humanlenk-restored \
  --db-snapshot-identifier humanlenk-backup-20240101
```

---

For additional support, refer to the main [README.md](../README.md) or create an issue in the GitHub repository.
