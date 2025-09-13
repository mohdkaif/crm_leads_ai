# 🚀 CRM Leads AI - AWS Deployment Guide

This guide provides step-by-step instructions for deploying the CRM Leads AI application to AWS using Docker, ECS, and CloudFormation.

## 📋 Prerequisites

### Required Tools
- [AWS CLI](https://aws.amazon.com/cli/) (v2.x)
- [Docker](https://www.docker.com/get-started)
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18.x)

### AWS Account Setup
1. Create an AWS account
2. Set up IAM user with appropriate permissions
3. Configure AWS CLI credentials

## 🏗️ Architecture Overview

The application uses the following AWS services:
- **ECS Fargate** - Container orchestration
- **Application Load Balancer** - Traffic distribution
- **ECR** - Container registry
- **CloudFormation** - Infrastructure as Code
- **VPC** - Network isolation
- **CloudWatch** - Logging and monitoring

## 🚀 Quick Start Deployment

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd crm_leads_ai
```

### 2. Configure Environment Variables
Create a `.env.production` file:
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crm_ai

# JWT
JWT_SECRET=your-super-secret-jwt-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# AWS
AWS_REGION=us-east-1
```

### 3. Deploy to AWS
```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production deploy
```

## 📖 Detailed Deployment Steps

### Step 1: AWS Account Configuration

#### 1.1 Create IAM User
1. Go to AWS IAM Console
2. Create a new user: `crm-deployment-user`
3. Attach policies:
   - `AmazonECS_FullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`
   - `CloudFormationFullAccess`
   - `IAMFullAccess`
   - `AmazonVPCFullAccess`
   - `ElasticLoadBalancingFullAccess`

#### 1.2 Configure AWS CLI
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter region: us-east-1
# Enter output format: json
```

#### 1.3 Create ECR Repository
```bash
aws ecr create-repository --repository-name crm-leads-ai --region us-east-1
```

### Step 2: Infrastructure Deployment

#### 2.1 Deploy CloudFormation Stack
```bash
# Deploy infrastructure
./deploy.sh production infrastructure
```

This creates:
- VPC with public/private subnets
- Application Load Balancer
- ECS Cluster and Service
- Security Groups
- IAM Roles

#### 2.2 Store Secrets in AWS Systems Manager
```bash
# Store MongoDB URI
aws ssm put-parameter \
  --name "/crm/mongodb-uri" \
  --value "mongodb+srv://username:password@cluster.mongodb.net/crm_ai" \
  --type "SecureString"

# Store JWT Secret
aws ssm put-parameter \
  --name "/crm/jwt-secret" \
  --value "your-super-secret-jwt-key" \
  --type "SecureString"

# Store OpenAI API Key
aws ssm put-parameter \
  --name "/crm/openai-api-key" \
  --value "your-openai-api-key" \
  --type "SecureString"
```

### Step 3: Application Deployment

#### 3.1 Build and Push Docker Image
```bash
# Build and push image
./deploy.sh production build
```

#### 3.2 Deploy Application
```bash
# Deploy application
./deploy.sh production deploy
```

## 🔧 GitHub Actions CI/CD Setup

### 1. Repository Secrets
Add these secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

### 2. Workflow Configuration
The GitHub Actions workflow is already configured in `.github/workflows/deploy.yml`:

- **Main branch** → Production deployment
- **Develop branch** → Staging deployment
- **Pull requests** → Run tests only

### 3. Enable GitHub Actions
1. Go to your repository settings
2. Navigate to "Actions" → "General"
3. Enable "Allow all actions and reusable workflows"

## 🐳 Local Development with Docker

### 1. Start Development Environment
```bash
# Start MongoDB and Redis
docker-compose -f docker-compose.dev.yml up -d

# Start development server
npm run dev
```

### 2. Production-like Local Testing
```bash
# Build and run production image locally
docker-compose up --build
```

## 📊 Monitoring and Logs

### CloudWatch Logs
- Log Group: `/ecs/production-crm`
- Stream: `ecs/crm-leads-ai`

### View Logs
```bash
# View recent logs
aws logs tail /ecs/production-crm --follow

# View specific log stream
aws logs get-log-events \
  --log-group-name /ecs/production-crm \
  --log-stream-name ecs/crm-leads-ai/$(date +%Y/%m/%d)
```

## 🔄 Deployment Commands

### Full Deployment
```bash
./deploy.sh production deploy
```

### Build Only
```bash
./deploy.sh production build
```

### Infrastructure Only
```bash
./deploy.sh production infrastructure
```

### Update Service
```bash
./deploy.sh production update
```

### Check Status
```bash
./deploy.sh production status
```

### Cleanup
```bash
./deploy.sh production cleanup
```

## 🌍 Environment-Specific Deployments

### Production
```bash
./deploy.sh production deploy
```

### Staging
```bash
./deploy.sh staging deploy
```

### Development
```bash
./deploy.sh development deploy
```

## 🔒 Security Best Practices

### 1. Secrets Management
- Use AWS Systems Manager Parameter Store for secrets
- Never commit secrets to version control
- Rotate secrets regularly

### 2. Network Security
- Application runs in private subnets
- Load balancer in public subnets
- Security groups restrict traffic

### 3. Container Security
- Use non-root user in containers
- Regular security updates
- Minimal base images

## 🚨 Troubleshooting

### Common Issues

#### 1. ECS Service Won't Start
```bash
# Check service status
aws ecs describe-services --cluster production-crm-cluster --services production-crm-service

# Check task definition
aws ecs describe-task-definition --task-definition production-crm-task
```

#### 2. Load Balancer Health Checks Failing
- Verify security group rules
- Check application health endpoint
- Review CloudWatch logs

#### 3. Database Connection Issues
- Verify MongoDB URI in Parameter Store
- Check security group rules
- Test connection from ECS task

### Debug Commands
```bash
# Get ECS service events
aws ecs describe-services --cluster production-crm-cluster --services production-crm-service --query 'services[0].events'

# Get task logs
aws logs get-log-events --log-group-name /ecs/production-crm --log-stream-name ecs/crm-leads-ai/$(date +%Y/%m/%d)

# Test load balancer
curl -I http://your-alb-dns-name
```

## 📈 Scaling

### Auto Scaling
The ECS service is configured for auto-scaling based on CPU and memory usage.

### Manual Scaling
```bash
# Scale service
aws ecs update-service \
  --cluster production-crm-cluster \
  --service production-crm-service \
  --desired-count 5
```

## 💰 Cost Optimization

### 1. Use Fargate Spot
- 70% cost reduction
- Configured in CloudFormation template

### 2. Right-size Resources
- Monitor CPU and memory usage
- Adjust task definition as needed

### 3. Scheduled Scaling
- Scale down during off-hours
- Use AWS EventBridge for scheduling

## 🔄 Updates and Maintenance

### Application Updates
1. Push code to main branch
2. GitHub Actions automatically deploys
3. Monitor deployment in CloudWatch

### Infrastructure Updates
1. Update CloudFormation template
2. Deploy with `./deploy.sh production infrastructure`
3. Verify all resources are updated

## 📞 Support

For issues or questions:
1. Check CloudWatch logs
2. Review GitHub Actions logs
3. Check AWS service health
4. Contact your DevOps team

## 📚 Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [CloudFormation Templates](https://docs.aws.amazon.com/cloudformation/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
