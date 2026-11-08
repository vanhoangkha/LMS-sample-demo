# Hướng Dẫn Deploy LMS Lên AWS Amplify với GitHub CI/CD

## Tổng Quan

Hướng dẫn này sẽ giúp bạn deploy ứng dụng LMS lên AWS Amplify và thiết lập CI/CD tự động từ GitHub.

## Yêu Cầu

- AWS Account với quyền truy cập Amplify
- AWS CLI đã cài đặt và cấu hình
- Amplify CLI đã cài đặt (`npm install -g @aws-amplify/cli`)
- GitHub Personal Access Token (tạo tại: https://github.com/settings/tokens)
- Repository: https://github.com/vanhoangkha/LMS-sample-demo.git

## Phương Pháp 1: Deploy Tự Động (Khuyến Nghị)

### Bước 1: Cấu hình AWS Credentials

```bash
aws configure
# Nhập:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: ap-southeast-1
# - Default output format: json
```

### Bước 2: Set GitHub Token

```bash
export GITHUB_TOKEN="your_github_token_here"
```

**Lưu ý**: Token cần có quyền `repo` để kết nối với GitHub repository.

### Bước 3: Chạy Script Deploy

```bash
cd /home/ubuntu/LMS-sample-demo
chmod +x setup-amplify-cicd.sh
./setup-amplify-cicd.sh
```

Script sẽ tự động:
- Kiểm tra prerequisites
- Commit và push `amplify.yml` lên GitHub
- Tạo Amplify App
- Kết nối GitHub repository
- Cấu hình CI/CD pipeline
- Trigger deployment đầu tiên

### Bước 4: Theo Dõi Deployment

Sau khi script chạy xong, bạn sẽ nhận được:
- **App URL**: `https://master.{APP_ID}.amplifyapp.com`
- **Console URL**: Link để theo dõi build progress

## Phương Pháp 2: Deploy Qua AWS Console (Manual)

### Bước 1: Truy Cập AWS Amplify Console

1. Đăng nhập AWS Console
2. Tìm và mở **AWS Amplify** service
3. Click **New app** → **Host web app**

### Bước 2: Kết Nối GitHub

1. Chọn **GitHub** làm repository provider
2. Click **Authorize AWS Amplify**
3. Nhập GitHub token (tạo tại https://github.com/settings/tokens với scope `repo`)
4. Chọn repository: **vanhoangkha/LMS-sample-demo**
5. Chọn branch: **master**

### Bước 3: Cấu Hình Build Settings

AWS Amplify sẽ tự động phát hiện `amplify.yml` trong repository.

Verify build settings:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - amplifyPush --simple
frontend:
  phases:
    preBuild:
      commands:
        - cd lms
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: lms/build
    files:
      - '**/*'
  cache:
    paths:
      - lms/node_modules/**/*
```

### Bước 4: Cấu Hình Environment Variables (Optional)

Thêm các biến môi trường nếu cần:

- `AMPLIFY_MONOREPO_APP_ROOT`: `lms`
- `AMPLIFY_DIFF_DEPLOY`: `true`
- `AMPLIFY_SKIP_BACKEND_BUILD`: `false`

### Bước 5: Review và Deploy

1. Review tất cả settings
2. Click **Save and deploy**
3. Theo dõi build progress trong console

## Cấu Trúc Amplify Backend

Dự án đã có sẵn Amplify backend với:

### Authentication
- **Service**: Amazon Cognito
- **Resource**: lmsbc7a393d
- **Sign-in**: Email
- **MFA**: OFF

### API Gateway
- **Name**: courses
- **Type**: REST API
- **Endpoints**: 9 Lambda functions

### Lambda Functions
1. `courses` - Quản lý courses
2. `lectures` - Quản lý lectures
3. `categories` - Quản lý categories
4. `users` - Quản lý users
5. `usersLectures` - Tracking user lectures
6. `UserCourse` - User course enrollment
7. `certs` - Certificate generation
8. `FAQs` - FAQ management
9. `uiConfig` - UI configuration

### DynamoDB Tables
- Categories
- Courses
- Lectures
- Users
- UserCourse
- UserLecture
- UserProgress
- Cert
- FAQs
- UIConfig
- AccessCode
- CourseCode
- CourseOpportunity
- Contributor

### Storage
- **S3 Bucket**: lectureresource (video storage)
- **Region**: ap-southeast-1

## CI/CD Workflow

### Automatic Deployment Triggers

Sau khi setup, mỗi khi bạn push code lên GitHub:

1. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push origin master
   ```

2. **Auto Build**: Amplify tự động detect thay đổi
3. **Build Process**:
   - Provision environment
   - Backend deployment (Lambda, DynamoDB, etc.)
   - Frontend build (React app)
   - Deploy to CDN
4. **Go Live**: Tự động publish sau khi build thành công

### Build Phases

```
┌─────────────────┐
│   Provision     │  ~1 min
└────────┬────────┘
         │
┌────────▼────────┐
│  Backend Build  │  ~3-5 min
└────────┬────────┘
         │
┌────────▼────────┐
│ Frontend Build  │  ~2-3 min
└────────┬────────┘
         │
┌────────▼────────┐
│     Deploy      │  ~1 min
└────────┬────────┘
         │
┌────────▼────────┐
│    Verify       │  ~30 sec
└─────────────────┘
```

Total time: ~7-10 phút

## Monitoring & Troubleshooting

### Xem Build Logs

1. Mở AWS Amplify Console
2. Click vào app của bạn
3. Chọn branch **master**
4. Click vào build đang chạy để xem logs

### Common Issues

#### Issue 1: Build Failed - npm install error
**Solution**:
```bash
# Xóa node_modules và package-lock.json
cd lms
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "fix: update package-lock.json"
git push
```

#### Issue 2: Backend deployment failed
**Solution**:
```bash
# Re-init Amplify backend locally
cd lms
amplify init
amplify push
```

#### Issue 3: Permission errors
**Solution**: Kiểm tra IAM roles và permissions trong AWS Console

### Rollback Deployment

Nếu deployment có vấn đề:

1. Mở Amplify Console
2. Click vào app → branch
3. Tìm build version trước đó working
4. Click **Redeploy this version**

## Custom Domain (Optional)

### Thêm Custom Domain

1. Mở Amplify Console → App settings → Domain management
2. Click **Add domain**
3. Nhập domain name (ví dụ: lms.yourdomain.com)
4. Follow hướng dẫn để config DNS records
5. Wait cho SSL certificate provision (~15 phút)

### DNS Configuration

Amplify sẽ provide CNAME records để add vào DNS provider:

```
Type: CNAME
Name: lms
Value: {amplify-domain}
```

## Performance Optimization

### Enable Caching

Amplify tự động enable CDN caching cho:
- Static assets (JS, CSS, images)
- Cache duration: 1 năm
- Automatic cache invalidation on new deployments

### Build Performance

Optimize build time với caching:
- `node_modules` được cache tự động
- Incremental builds for unchanged files
- Parallel backend và frontend builds

## Security Best Practices

1. **GitHub Token**: Lưu token an toàn, không commit vào code
2. **Environment Variables**: Dùng Amplify environment variables cho secrets
3. **IAM Roles**: Sử dụng least privilege principle
4. **HTTPS**: Amplify tự động enable HTTPS
5. **CORS**: Configure đúng CORS trong API Gateway

## Cost Estimation

### AWS Amplify Hosting
- **Build minutes**: $0.01/phút (50 phút free/tháng)
- **Hosting**: $0.15/GB served (15 GB free/tháng)
- **Storage**: $0.023/GB stored (5 GB free/tháng)

### Backend Services (đã deploy)
- **Lambda**: Pay per request
- **DynamoDB**: Pay per request
- **S3**: Storage + data transfer
- **API Gateway**: Pay per request
- **Cognito**: Free tier: 50,000 MAUs

Estimated monthly cost: $10-50 (depending on traffic)

## Support

### AWS Amplify Documentation
- https://docs.aws.amazon.com/amplify/

### GitHub Repository
- https://github.com/vanhoangkha/LMS-sample-demo

### Helpful Commands

```bash
# Check Amplify status
amplify status

# View backend info
amplify env list
amplify env get

# Pull latest backend
amplify pull

# Push changes
amplify push

# Open Amplify Console
amplify console

# View logs
amplify console api
```

## Checklist

- [ ] AWS credentials configured
- [ ] Amplify CLI installed
- [ ] GitHub token ready
- [ ] amplify.yml committed
- [ ] Run deployment script hoặc manual setup
- [ ] Monitor first deployment
- [ ] Test application URL
- [ ] Verify CI/CD với một commit mới
- [ ] (Optional) Configure custom domain
- [ ] (Optional) Set up monitoring alerts

## Kết Luận

Sau khi hoàn tất các bước trên, bạn sẽ có:

LMS application deployed lên AWS Amplify
GitHub CI/CD tự động
Backend services (Lambda, DynamoDB, S3) running
Authentication với Cognito
HTTPS enabled
CDN global distribution
Auto-scaling infrastructure

Mỗi lần push code lên GitHub, ứng dụng sẽ tự động build và deploy!

---

**Generated with Claude Code**
