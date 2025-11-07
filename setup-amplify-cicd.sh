#!/bin/bash

# AWS Amplify CI/CD Setup Script
# This script helps configure AWS Amplify with GitHub CI/CD

set -e

echo "🚀 AWS Amplify CI/CD Setup for LMS"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/vanhoangkha/LMS-sample-demo.git"
BRANCH="master"
REGION="ap-southeast-1"
APP_NAME="lms-application"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

# Check if GitHub token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ GitHub token not provided${NC}"
    echo "Please set GITHUB_TOKEN environment variable:"
    echo "  export GITHUB_TOKEN='your_token_here'"
    echo ""
    echo "Create a token at: https://github.com/settings/tokens"
    echo "Required scopes: repo"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo -e "${RED}❌ Amplify CLI is not installed${NC}"
    echo "Installing Amplify CLI..."
    npm install -g @aws-amplify/cli
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Please run: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"
echo ""

echo -e "${YELLOW}Step 2: Git setup...${NC}"
echo ""

# Commit and push changes
echo "Committing amplify.yml to repository..."
git add amplify.yml
if git diff --staged --quiet; then
    echo "No changes to commit"
else
    git commit -m "feat: add Amplify CI/CD configuration

- Add amplify.yml for build specification
- Configure frontend and backend build phases
- Set up artifact and cache configuration

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    echo "Pushing to remote repository..."
    git push origin ${BRANCH}
fi

echo -e "${GREEN}✅ Git setup completed${NC}"
echo ""

echo -e "${YELLOW}Step 3: Creating Amplify App...${NC}"
echo ""

# Check if app already exists
EXISTING_APP_ID=$(aws amplify list-apps --region ${REGION} --query "apps[?name=='${APP_NAME}'].appId" --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_APP_ID" ]; then
    echo -e "${YELLOW}⚠️  Amplify app '${APP_NAME}' already exists with ID: ${EXISTING_APP_ID}${NC}"
    echo "Using existing app..."
    APP_ID=$EXISTING_APP_ID
else
    echo "Creating new Amplify app..."

    # Create Amplify app
    CREATE_RESULT=$(aws amplify create-app \
        --name ${APP_NAME} \
        --repository ${REPO_URL} \
        --platform WEB \
        --region ${REGION} \
        --oauth-token ${GITHUB_TOKEN} \
        --enable-auto-branch-creation \
        --auto-branch-creation-config enableAutoBuild=true,enablePullRequestPreview=true \
        --output json)

    APP_ID=$(echo $CREATE_RESULT | jq -r '.app.appId')
    echo -e "${GREEN}✅ Created Amplify app with ID: ${APP_ID}${NC}"
fi

echo ""

echo -e "${YELLOW}Step 4: Creating branch connection...${NC}"
echo ""

# Check if branch already exists
EXISTING_BRANCH=$(aws amplify list-branches --app-id ${APP_ID} --region ${REGION} --query "branches[?branchName=='${BRANCH}'].branchName" --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_BRANCH" ]; then
    echo -e "${YELLOW}⚠️  Branch '${BRANCH}' already connected${NC}"
else
    # Create branch
    aws amplify create-branch \
        --app-id ${APP_ID} \
        --branch-name ${BRANCH} \
        --enable-auto-build \
        --region ${REGION} > /dev/null

    echo -e "${GREEN}✅ Connected branch: ${BRANCH}${NC}"
fi

echo ""

echo -e "${YELLOW}Step 5: Setting up environment variables...${NC}"
echo ""

# Set environment variables for Amplify
aws amplify update-app \
    --app-id ${APP_ID} \
    --region ${REGION} \
    --environment-variables \
        AMPLIFY_MONOREPO_APP_ROOT=lms \
        AMPLIFY_DIFF_DEPLOY=true \
        AMPLIFY_SKIP_BACKEND_BUILD=false > /dev/null

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

echo -e "${YELLOW}Step 6: Starting initial deployment...${NC}"
echo ""

# Start build
BUILD_RESULT=$(aws amplify start-job \
    --app-id ${APP_ID} \
    --branch-name ${BRANCH} \
    --job-type RELEASE \
    --region ${REGION} \
    --output json)

JOB_ID=$(echo $BUILD_RESULT | jq -r '.jobSummary.jobId')

echo -e "${GREEN}✅ Build started with Job ID: ${JOB_ID}${NC}"
echo ""

# Get the app URL
APP_URL="https://${BRANCH}.${APP_ID}.amplifyapp.com"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ AWS Amplify CI/CD Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📱 ${YELLOW}App ID:${NC} ${APP_ID}"
echo -e "🌐 ${YELLOW}App URL:${NC} ${APP_URL}"
echo -e "🔗 ${YELLOW}Console:${NC} https://console.aws.amazon.com/amplify/home?region=${REGION}#/${APP_ID}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Monitor the build progress in the Amplify Console"
echo "2. Once deployed, test the application at: ${APP_URL}"
echo "3. Future commits to '${BRANCH}' will automatically trigger deployments"
echo ""
echo -e "${GREEN}🎉 Your CI/CD pipeline is now active!${NC}"
echo ""
