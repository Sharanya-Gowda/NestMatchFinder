# NestMatch CI/CD Pipeline & Deployment Guide

## Overview
Complete CI/CD pipeline with Docker, testing, security scanning, and automated deployment using GitHub Actions.

## Quick Setup Commands

### 1. Install Additional Testing Dependencies
```bash
npm install --save-dev eslint @typescript-eslint/eslint-plugin eslint-plugin-security eslint-plugin-react-hooks
```

### 2. Add Package.json Scripts
Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "lint": "tsc --noEmit",
    "security:audit": "npm audit",
    "docker:build": "docker build -t nestmatch .",
    "docker:run": "docker run -p 5000:5000 nestmatch"
  }
}
```

### 3. Test Your Setup Locally
```bash
# Run tests
npm test

# Generate coverage report
npm run test:coverage

# Build Docker image
npm run docker:build

# Run security audit
npm run security:audit
```

## GitHub Actions Setup

### Required Secrets
Add these secrets to your GitHub repository settings:

1. **DOCKER_USERNAME** - Your Docker Hub username
2. **DOCKER_PASSWORD** - Your Docker Hub password/token
3. **SNYK_TOKEN** - Snyk security scanning token
4. **DATABASE_URL** - Production database connection string

### Pipeline Features

#### ✅ Automated Testing
- Unit tests with Jest
- Integration tests
- Code coverage reporting (70% threshold)
- TypeScript type checking

#### ✅ Security Scanning
- npm audit for vulnerabilities
- Snyk security analysis
- OWASP dependency check
- CodeQL static analysis
- Docker image vulnerability scanning

#### ✅ Build & Deploy
- Multi-stage Docker builds
- Automated deployments to staging/production
- Kubernetes manifests included

## Local Development Commands

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run linting
npm run lint

# Build for production
npm run build

# Build Docker image
docker build -t nestmatch .

# Run with Docker Compose
docker-compose up
```

## Security Features

### Static Analysis
- ESLint security plugin rules
- CodeQL scanning
- Dependency vulnerability checks

### Runtime Security
- Non-root Docker user
- Security context in Kubernetes
- Rate limiting on ingress
- SSL/TLS encryption

### Container Security
- Multi-stage builds to minimize attack surface
- Trivy vulnerability scanning
- Security-focused base images

## Deployment Options

### Option 1: Docker Compose (Simple)
```bash
docker-compose up -d
```

### Option 2: Kubernetes (Production)
```bash
kubectl apply -f k8s/production/
```

### Option 3: Cloud Platforms
- **Heroku**: Use included Dockerfile
- **AWS ECS**: Use provided task definitions
- **Google Cloud Run**: Deploy container directly
- **Digital Ocean App Platform**: Connect GitHub repo

## Monitoring & Observability

The pipeline includes:
- Health checks for application availability
- Resource limits and requests
- Liveness and readiness probes
- Centralized logging capability

## Coverage Reports

After running tests with coverage:
- View HTML report: `open coverage/lcov-report/index.html`
- CI uploads results to Codecov automatically

## Security Compliance

The setup includes:
- OWASP Top 10 vulnerability checks
- Regular dependency updates
- Automated security scanning
- Container image hardening

## Next Steps

1. Push your code to GitHub
2. Add required secrets to repository settings
3. The pipeline will automatically run on push/PR
4. Monitor deployment in Actions tab
5. View security reports in Security tab

## Troubleshooting

### Common Issues:
- **Tests failing**: Check jest.config.js paths
- **Docker build errors**: Verify Dockerfile syntax
- **Security scan failures**: Review and fix reported vulnerabilities
- **Deployment issues**: Check Kubernetes manifests and secrets

### Getting Help:
- Review GitHub Actions logs
- Check container logs: `docker logs <container-id>`
- Verify environment variables and secrets