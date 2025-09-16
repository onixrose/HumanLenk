#!/bin/bash

# HumanLenk Development Scripts
# This file contains helpful scripts for development and deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Setup development environment
setup_dev() {
    log_info "Setting up development environment..."
    
    # Check prerequisites
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists yarn; then
        log_error "Yarn is not installed. Please install Yarn first."
        exit 1
    fi
    
    # Install dependencies
    log_info "Installing dependencies..."
    yarn install
    
    # Copy environment files
    if [ ! -f "apps/backend/.env" ]; then
        log_info "Creating backend environment file..."
        cp apps/backend/env.example apps/backend/.env
        log_warning "Please edit apps/backend/.env with your configuration"
    fi
    
    if [ ! -f ".env" ]; then
        log_info "Creating root environment file..."
        cp env.example .env
        log_warning "Please edit .env with your configuration"
    fi
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    yarn db:generate
    
    log_success "Development environment setup complete!"
    log_info "Run 'yarn dev' to start development servers"
}

# Start development servers
start_dev() {
    log_info "Starting development servers..."
    yarn dev
}

# Build all packages
build_all() {
    log_info "Building all packages..."
    yarn build
}

# Run tests
run_tests() {
    log_info "Running tests..."
    yarn test
}

# Lint code
lint_code() {
    log_info "Linting code..."
    yarn lint
}

# Type check
type_check() {
    log_info "Type checking..."
    yarn type-check
}

# Format code
format_code() {
    log_info "Formatting code..."
    yarn format
}

# Database operations
db_generate() {
    log_info "Generating Prisma client..."
    yarn db:generate
}

db_migrate() {
    log_info "Running database migrations..."
    yarn db:migrate
}

db_push() {
    log_info "Pushing database schema..."
    yarn db:push
}

db_studio() {
    log_info "Opening Prisma Studio..."
    yarn db:studio
}

db_reset() {
    log_warning "This will reset your database. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Resetting database..."
        yarn db:push --force-reset
        log_success "Database reset complete"
    else
        log_info "Database reset cancelled"
    fi
}

# Security audit
security_audit() {
    log_info "Running security audit..."
    yarn audit
}

# Bundle analysis
analyze_bundle() {
    log_info "Analyzing bundle size..."
    yarn analyze
}

# Clean build artifacts
clean_build() {
    log_info "Cleaning build artifacts..."
    yarn clean
    rm -rf node_modules
    rm -rf apps/*/node_modules
    rm -rf packages/*/node_modules
    log_success "Build artifacts cleaned"
}

# Docker operations
docker_build() {
    log_info "Building Docker images..."
    docker-compose build
}

docker_up() {
    log_info "Starting Docker containers..."
    docker-compose up -d
}

docker_down() {
    log_info "Stopping Docker containers..."
    docker-compose down
}

docker_logs() {
    log_info "Showing Docker logs..."
    docker-compose logs -f
}

# Production deployment
deploy_frontend() {
    log_info "Deploying frontend..."
    cd apps/frontend
    yarn build
    # Add your deployment commands here
    log_success "Frontend deployed"
}

deploy_backend() {
    log_info "Deploying backend..."
    cd apps/backend
    yarn build
    # Add your deployment commands here
    log_success "Backend deployed"
}

# Health check
health_check() {
    log_info "Checking application health..."
    
    # Check if frontend is running
    if curl -s http://localhost:4000 > /dev/null; then
        log_success "Frontend is running on http://localhost:4000"
    else
        log_error "Frontend is not running"
    fi
    
    # Check if backend is running
    if curl -s http://localhost:5000/health > /dev/null; then
        log_success "Backend is running on http://localhost:5000"
    else
        log_error "Backend is not running"
    fi
}

# Show help
show_help() {
    echo "HumanLenk Development Scripts"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup-dev      Setup development environment"
    echo "  dev            Start development servers"
    echo "  build          Build all packages"
    echo "  test           Run tests"
    echo "  lint           Lint code"
    echo "  type-check     Type check code"
    echo "  format         Format code"
    echo "  db-generate    Generate Prisma client"
    echo "  db-migrate     Run database migrations"
    echo "  db-push        Push database schema"
    echo "  db-studio      Open Prisma Studio"
    echo "  db-reset       Reset database (with confirmation)"
    echo "  audit          Run security audit"
    echo "  analyze        Analyze bundle size"
    echo "  clean          Clean build artifacts"
    echo "  docker-build   Build Docker images"
    echo "  docker-up      Start Docker containers"
    echo "  docker-down    Stop Docker containers"
    echo "  docker-logs    Show Docker logs"
    echo "  deploy-frontend Deploy frontend"
    echo "  deploy-backend  Deploy backend"
    echo "  health         Check application health"
    echo "  help           Show this help message"
}

# Main script logic
case "${1:-help}" in
    setup-dev)
        setup_dev
        ;;
    dev)
        start_dev
        ;;
    build)
        build_all
        ;;
    test)
        run_tests
        ;;
    lint)
        lint_code
        ;;
    type-check)
        type_check
        ;;
    format)
        format_code
        ;;
    db-generate)
        db_generate
        ;;
    db-migrate)
        db_migrate
        ;;
    db-push)
        db_push
        ;;
    db-studio)
        db_studio
        ;;
    db-reset)
        db_reset
        ;;
    audit)
        security_audit
        ;;
    analyze)
        analyze_bundle
        ;;
    clean)
        clean_build
        ;;
    docker-build)
        docker_build
        ;;
    docker-up)
        docker_up
        ;;
    docker-down)
        docker_down
        ;;
    docker-logs)
        docker_logs
        ;;
    deploy-frontend)
        deploy_frontend
        ;;
    deploy-backend)
        deploy_backend
        ;;
    health)
        health_check
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
