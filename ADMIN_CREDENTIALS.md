# 🔐 Admin Credentials for CRM Leads AI

## Admin User Access

Use these credentials to test all features of the CRM Leads AI application:

### 📧 **Email:** `admin@crmleadsai.com`
### 🔑 **Password:** `admin123`

---

## 🎯 Admin Permissions

The admin user has **full access** to all features:

- ✅ **Leads Management** - Create, read, update, delete leads
- ✅ **User Management** - Manage all users and their roles
- ✅ **Analytics Dashboard** - View all performance metrics
- ✅ **AI Insights** - Access AI-powered recommendations
- ✅ **Activity Tracking** - View and manage all activities
- ✅ **Settings** - Configure system settings
- ✅ **Profile Management** - Update user profile

---

## 🚀 How to Login

1. **Open the application:** http://localhost:3000
2. **Click "Login"** or go to http://localhost:3000/login
3. **Enter credentials:**
   - Email: `admin@crmleadsai.com`
   - Password: `admin123`
4. **Click "Sign In"**

---

## 🧪 Testing Features

Once logged in as admin, you can test:

### 📊 **Dashboard** (`/`)
- View main CRM dashboard
- See key performance indicators
- Access quick actions

### 👥 **Leads Management** (`/leads`)
- View all leads
- Create new leads (`/leads/new`)
- Edit existing leads
- Delete leads

### 📈 **Analytics** (`/analytics`)
- View performance metrics
- Check lead conversion rates
- Monitor team performance

### 🤖 **AI Insights** (`/ai-insights`)
- View AI recommendations
- Check lead scoring
- Analyze sentiment trends

### ⏰ **Activities** (`/activities`)
- View all activities
- Filter by user, date, type
- Track engagement

### 👤 **Users** (`/users`)
- Manage team members
- Assign roles and permissions
- View user performance

### ⚙️ **Settings** (`/settings`)
- Configure system settings
- Manage integrations
- Set up notifications

### 👤 **Profile** (`/profile`)
- Update personal information
- Change password
- Manage account settings

---

## 🔒 Security Note

**This is a development/testing admin account.**
- For production use, create proper admin users through the database
- Change default credentials before deploying
- Implement proper user management and role-based access control

---

## 🛠️ Development

The admin user is hardcoded in the authentication system for easy testing. To modify or add more test users, edit:

- `server/api/auth/login.post.ts` - Login logic
- `server/api/auth/me.get.ts` - User profile data

---

**Happy Testing! 🎉**
