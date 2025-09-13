#!/bin/bash

# CRM Leads AI - AWS Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh production deploy

set -e

# Configuration
ENVIRONMENT=${1:-production}
ACTION=${2:-deploy}
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPOSITORY="crm-leads-ai"
STACK_NAME="crm-leads-ai-${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    log_success "AWS CLI is installed"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    log_success "Docker is installed"
}

# Get AWS account ID
get_account_id() {
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    if [ -z "$ACCOUNT_ID" ]; then
        log_error "Failed to get AWS account ID. Please check your AWS credentials."
        exit 1
    fi
    log_info "AWS Account ID: $ACCOUNT_ID"
}

# Create ECR repository if it doesn't exist
create_ecr_repository() {
    log_info "Checking ECR repository..."
    if ! aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION &> /dev/null; then
        log_info "Creating ECR repository: $ECR_REPOSITORY"
        aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION
        log_success "ECR repository created"
    else
        log_success "ECR repository already exists"
    fi
}

# Build and push Docker image
build_and_push_image() {
    log_info "Building Docker image..."
    
    # Get ECR login token
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build image
    docker build -t $ECR_REPOSITORY:latest .
    
    # Tag image for ECR
    docker tag $ECR_REPOSITORY:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
    docker tag $ECR_REPOSITORY:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$(git rev-parse --short HEAD)
    
    # Push image
    log_info "Pushing image to ECR..."
    docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
    docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$(git rev-parse --short HEAD)
    
    log_success "Image pushed to ECR"
}

# Deploy CloudFormation stack
deploy_infrastructure() {
    log_info "Deploying CloudFormation stack: $STACK_NAME"
    
    # Update task definition with correct account ID
    sed "s/YOUR_ACCOUNT_ID/$ACCOUNT_ID/g" aws-task-definition.json > aws-task-definition-updated.json
    
    # Deploy stack
    aws cloudformation deploy \
        --template-file aws-infrastructure.yml \
        --stack-name $STACK_NAME \
        --parameter-overrides Environment=$ENVIRONMENT \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $AWS_REGION
    
    log_success "Infrastructure deployed"
}

# Update ECS service
update_ecs_service() {
    log_info "Updating ECS service..."
    
    # Get cluster name
    CLUSTER_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`ECSCluster`].OutputValue' --output text --region $AWS_REGION)
    
    # Get service name
    SERVICE_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`ECSService`].OutputValue' --output text --region $AWS_REGION)
    
    # Force new deployment
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --force-new-deployment \
        --region $AWS_REGION
    
    log_success "ECS service updated"
}

# Get application URL
get_application_url() {
    log_info "Getting application URL..."
    
    ALB_DNS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`ALBDNSName`].OutputValue' --output text --region $AWS_REGION)
    
    log_success "Application URL: http://$ALB_DNS"
}

# Clean up resources
cleanup() {
    log_warning "This will delete all resources. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Deleting CloudFormation stack..."
        aws cloudformation delete-stack --stack-name $STACK_NAME --region $AWS_REGION
        
        log_info "Waiting for stack deletion to complete..."
        aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME --region $AWS_REGION
        
        log_success "Resources cleaned up"
    else
        log_info "Cleanup cancelled"
    fi
}

# Main deployment function
deploy() {
    log_info "Starting deployment for environment: $ENVIRONMENT"
    
    check_aws_cli
    check_docker
    get_account_id
    create_ecr_repository
    build_and_push_image
    deploy_infrastructure
    update_ecs_service
    get_application_url
    
    log_success "Deployment completed successfully!"
}

# Main script logic
case $ACTION in
    "deploy")
        deploy
        ;;
    "build")
        check_docker
        get_account_id
        create_ecr_repository
        build_and_push_image
        ;;
    "infrastructure")
        check_aws_cli
        get_account_id
        deploy_infrastructure
        ;;
    "update")
        check_aws_cli
        get_account_id
        update_ecs_service
        get_application_url
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        check_aws_cli
        get_account_id
        get_application_url
        ;;
    *)
        echo "Usage: $0 [environment] [action]"
        echo "Environments: production, staging, development"
        echo "Actions: deploy, build, infrastructure, update, cleanup, status"
        echo ""
        echo "Examples:"
        echo "  $0 production deploy     # Full deployment to production"
        echo "  $0 staging build         # Build and push image for staging"
        echo "  $0 production update     # Update ECS service"
        echo "  $0 production cleanup    # Delete all resources"
        exit 1
        ;;
esac
