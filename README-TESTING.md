# CampX E2E Testing with Playwright

## 🧪 **Test Suite Overview**

Comprehensive end-to-end testing suite for the entire CampX application using Playwright.

## 📁 **Test Files Structure**

```
tests/
├── auth.spec.ts          # Authentication flow tests
├── onboarding.spec.ts     # User onboarding tests
├── feeds.spec.ts          # Explore & College Feed tests
├── profiles.spec.ts       # Profile & search functionality tests
├── communities.spec.ts     # Community system tests
├── verification.spec.ts    # Verification process tests
└── .env.test             # Test environment variables
```

## 🚀 **Running Tests**

### **Run All Tests (Headless)**
```bash
npm run test
```

### **Run Tests with UI (Watch Mode)**
```bash
npm run test:ui
```

### **View HTML Report**
```bash
npm run test:report
```

## 📊 **Test Coverage**

### **Authentication** (`auth.spec.ts`)
- ✅ Login form renders correctly
- ✅ Signup form renders correctly
- ✅ Form validation works
- ✅ Email validation works
- ✅ Auth redirects work correctly
- ✅ Protected routes redirect unauthenticated users

### **Onboarding** (`onboarding.spec.ts`)
- ✅ Redirects unprofiled users to onboarding
- ✅ Age validation works
- ✅ Form validation works
- ✅ Successful onboarding redirects to home

### **Feeds** (`feeds.spec.ts`)
- ✅ Explore feed loads posts
- ✅ Basic users see upgrade prompts
- ✅ Verified users can create posts
- ✅ Accomplish posts work correctly
- ✅ Like functionality works
- ✅ Comment functionality works
- ✅ College feed restrictions work
- ✅ College filtering works

### **Profiles** (`profiles.spec.ts`)
- ✅ Profile navigation works
- ✅ Profile information displays correctly
- ✅ Follow system works
- ✅ Search functionality works
- ✅ Follower/following counts work

### **Communities** (`communities.spec.ts`)
- ✅ Communities page loads correctly
- ✅ Tier restrictions work
- ✅ Join functionality works
- ✅ Community limits enforced
- ✅ Creation permissions work
- ✅ Community space loads correctly

### **Verification** (`verification.spec.ts`)
- ✅ Verification page renders correctly
- ✅ Path selection works
- ✅ File upload validation works
- ✅ Submission flow works
- ✅ Verification banners work
- ✅ Access restrictions work

## 🔧 **Test Environment**

### **Environment Variables** (`.env.test`)
```env
TEST_EMAIL=test@example.com
TEST_PASSWORD=TestPassword123!
BASIC_EMAIL=basic@example.com
BASIC_PASSWORD=BasicPassword123!
VERIFIED_EMAIL=verified@example.com
VERIFIED_PASSWORD=VerifiedPassword123!
PRO_EMAIL=pro@example.com
PRO_PASSWORD=ProPassword123!
```

### **User Tiers Setup**
- **Basic User**: `basic@example.com` (Cannot post/comment/follow/join communities)
- **Verified User**: `verified@example.com` (Limited to 5 communities, can access College Feed)
- **Pro User**: `pro@example.com` (Full access, unlimited communities)

## 🎯 **Key Test Scenarios**

### **Authentication Flow**
1. Visit `/login` → Shows login form ✅
2. Visit `/signup` → Shows signup form ✅
3. Submit invalid data → Shows validation errors ✅
4. Unauthenticated visit protected routes → Redirects to `/login` ✅

### **User Journey**
1. **New User**: Signup → Onboarding → Home → Explore → Create Post ✅
2. **Existing User**: Login → Profile → Explore → College Feed ✅
3. **Verified User**: Login → College Feed → Communities → Join/Create ✅
4. **Pro User**: Login → Communities → Create Community → Manage ✅

### **Social Features**
1. **Posts**: Create text/photo/accomplish posts ✅
2. **Interactions**: Like/comment on posts ✅
3. **Profiles**: View/search/follow users ✅
4. **Communities**: Join/create/manage communities ✅

### **Business Logic**
1. **Tier System**: Basic users blocked from premium features ✅
2. **Verification**: Unverified users blocked from College Feed ✅
3. **Community Limits**: 5 community limit for verified users ✅
4. **College Matching**: College feed shows same-college posts only ✅

## 🐛 **Debugging Failed Tests**

### **Common Issues**
1. **Test Data**: Ensure test users exist in database
2. **Network**: Check if server is running on port 3000
3. **Timing**: Increase wait times for slow operations
4. **Selectors**: Update selectors if UI changes

### **Debug Commands**
```bash
# Run specific test file
npx playwright test tests/auth.spec.ts --headed

# Run with debugging
npx playwright test --debug

# Generate trace files
npx playwright test --trace on
```

## 📈 **CI/CD Integration**

### **GitHub Actions Example**
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🎯 **Best Practices**

1. **Test Isolation**: Each test cleans up auth state
2. **Realistic Data**: Use meaningful test data
3. **User Scenarios**: Test all user tiers and flows
4. **Error Cases**: Test validation and error states
5. **Performance**: Monitor test execution times
6. **Maintenance**: Keep tests updated with UI changes

## 🚨 **Known Limitations**

1. **Database State**: Tests assume clean database state
2. **Real-time Features**: WebSocket connections not fully testable
3. **File Uploads**: Limited file upload testing
4. **Email Verification**: OTP flow requires manual intervention

## 📝 **Running Tests Before Deployment**

```bash
# 1. Start development server
npm run dev

# 2. Run all tests
npm run test

# 3. Check coverage
npm run test:report

# 4. Deploy if tests pass
```

This comprehensive test suite ensures the entire CampX application works correctly across all user flows and business logic scenarios. 🎓
