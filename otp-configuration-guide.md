# Magic Link Verification Guide for CampX

## 📧 Configure Supabase Email Magic Links

### 1. Enable Email Authentication
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable "Enable email confirmations"
3. Set "Site URL" to: `http://localhost:3000`
4. Set "Redirect URLs" to: `http://localhost:3000/*`

### 2. Configure Email Templates
1. Go to Authentication → Email Templates
2. Edit "Confirm signup" template:
   ```
   <h2>Welcome to CampX!</h2>
   <p>Click the link below to verify your college email address:</p>
   <p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
   <p>This link will expire in 1 hour.</p>
   <p>If you didn't request this, please ignore this email.</p>
   ```

### 3. Test Email Provider
1. Go to Authentication → Settings
2. Check your email provider (default is Supabase email)
3. For development, Supabase provides free email service
4. For production, configure your own SMTP

## 🔧 How the Magic Link Flow Works

### Step 1: Send Magic Link
```typescript
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'student@college.edu',
  options: {
    emailRedirectTo: 'http://localhost:3000/verification'
  }
})
```

### Step 2: User Receives Email
- User gets a clickable verification link in their college email
- Link expires after 1 hour (configurable)
- Clicking the link redirects back to `/verification`

### Step 3: Automatic Verification
- When user returns, the app checks if email is confirmed
- If confirmed, profile is automatically updated to "verified"
- User is redirected to `/home` with verified status

## 🚀 Testing the Magic Link Flow

### 1. Run Database Setup
```sql
-- Run verification-setup.sql in Supabase SQL Editor
-- Run storage-setup.sql in Supabase SQL Editor
```

### 2. Test with Real Email
1. Go to `/verification`
2. Choose "Path A — College Email"
3. Enter a real email address (you can use your personal email for testing)
4. Check your email for the verification link
5. Click the link - should redirect you back to verification page
6. Page should automatically detect verification and redirect to home

### 3. Common Issues & Fixes

#### Issue: "Email not sent"
- Check Supabase email provider settings
- Verify email address is valid
- Check spam folder

#### Issue: "Link not working"
- Ensure redirect URL is correct in Supabase settings
- Check if link expired (1 hour)
- Try resending the verification link

#### Issue: "User not authenticated"
- Make sure you're logged in before accessing verification
- Check middleware authentication

#### Issue: "Verification not detected"
- Refresh the page after clicking the magic link
- Check browser console for errors
- Ensure email_confirmed_at is set in auth.users

## 📱 Mobile Testing Tips

1. **Test with different email providers**:
   - Gmail
   - College email domains
   - Outlook

2. **Check spam folders**:
   - Gmail: Spam/Promotions tab
   - College emails: Junk folder

3. **Test link clicking**:
   - Desktop browsers
   - Mobile browsers
   - Email clients

## 🔒 Security Features

- ✅ Magic links expire after 1 hour
- ✅ Rate limiting on magic link requests
- ✅ Email validation before sending
- ✅ Secure token verification
- ✅ Audit trail in verifications table
- ✅ Automatic verification on link click

## 🎯 Benefits of Magic Links vs OTP

### Magic Links (Current Implementation):
- ✅ More user-friendly (no code entry)
- ✅ Works out-of-the-box with Supabase
- ✅ Better mobile experience
- ✅ No code validation needed
- ✅ Automatic verification

### OTP Codes (Previous Implementation):
- ❌ Requires custom email templates
- ❌ Manual code entry
- ❌ More complex validation
- ❌ Higher user friction

## 🔄 Next Steps

Once magic links are working:
1. Test document upload flow
2. Implement admin review system
3. Add email notifications for status changes
4. Set up production email provider
