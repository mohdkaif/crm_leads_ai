# CRM Leads AI - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [System Architecture](#system-architecture)
4. [Features](#features)
5. [Documentation](#documentation)
6. [API Reference](#api-reference)
7. [Deployment](#deployment)
8. [Contributing](#contributing)

## 🚀 Overview

CRM Leads AI is a comprehensive Customer Relationship Management system built with modern web technologies, featuring AI-powered insights, role-based access control, and a complete lead lifecycle management system.

### Key Features
- **AI-Powered Lead Analysis**: Automatic lead scoring, sentiment analysis, and recommendations
- **Role-Based Access Control**: Granular permissions for Admin, Manager, Sales, and Viewer roles
- **Complete Lead Management**: Full CRUD operations with advanced filtering and search
- **Activity Tracking**: Comprehensive activity management with follow-up scheduling
- **Analytics & Reporting**: Real-time dashboards and performance metrics
- **User Management**: Complete user administration with team management
- **Modern UI/UX**: Responsive design with Tailwind CSS and Vue.js

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 4.4+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd crm-leads-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp env.example .env
```

4. **Configure environment variables**
```env
MONGODB_URI=mongodb://localhost:27017/crm_leads_ai
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
```

5. **Start the development server**
```bash
npm run dev
```

6. **Create admin user**
```bash
node scripts/create-admin.js
```

7. **Access the application**
Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Admin Credentials
- **Email**: admin@crmleadsai.com
- **Password**: admin123456

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: Nuxt.js 4.1.1, Vue.js 3, TypeScript
- **Backend**: Node.js, Nitro server
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **AI**: OpenAI API integration

### Project Structure
```
crm-leads-ai/
├── docs/                   # Documentation
├── server/                 # Backend API
│   ├── api/               # API endpoints
│   ├── middleware/        # Server middleware
│   ├── models/           # Database models
│   └── utils/            # Utility functions
├── pages/                 # Application pages
├── components/           # Reusable components
├── layouts/              # Layout components
├── composables/          # Vue composables
├── assets/               # Static assets
└── types/                # TypeScript definitions
```

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- User session management
- Password reset functionality

### 👥 User Management
- Complete user CRUD operations
- Role assignment (Admin, Manager, Sales, Viewer)
- User profile management
- Team management capabilities
- Activity tracking

### 📊 Lead Management
- Comprehensive lead data model
- Lead lifecycle management
- Advanced filtering and search
- Lead assignment and tracking
- Custom fields and tags
- Lead scoring and prioritization

### 🤖 AI-Powered Features
- Automatic lead scoring
- Sentiment analysis
- Engagement measurement
- Urgency detection
- Smart recommendations
- Follow-up suggestions

### 📈 Analytics & Reporting
- Real-time dashboard metrics
- Conversion rate tracking
- Lead source analysis
- Performance analytics
- Revenue tracking
- Trend analysis

### 📝 Activity Management
- Complete activity tracking
- Follow-up scheduling
- Activity types (calls, emails, meetings, notes)
- Due date management
- Activity history
- Team collaboration

## 📚 Documentation

### Core Documentation
- **[Role-Based Access Control](./ROLE_BASED_ACCESS_CONTROL.md)** - Complete RBAC system documentation
- **[Lead CRM System](./LEAD_CRM_SYSTEM.md)** - Comprehensive CRM system documentation
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation

### Key Concepts

#### User Roles
- **Admin**: Full system access and user management
- **Manager**: Team oversight and lead management
- **Sales**: Lead management and activity tracking
- **Viewer**: Read-only access for reporting

#### Lead Lifecycle
```
New → Contacted → Qualified → Proposal → Negotiation → Closed Won/Closed Lost
```

#### Permission System
- Resource-based permissions (leads, users, analytics, activities)
- Action-based permissions (create, read, update, delete)
- Context-aware permissions (own resources vs. all resources)

## 🔌 API Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication
All API endpoints require JWT token authentication:
```http
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints
- **Authentication**: `/api/auth/*`
- **Lead Management**: `/api/leads/*`
- **Activity Management**: `/api/activities/*`
- **Analytics**: `/api/analytics/*`
- **AI Insights**: `/api/ai/*`
- **User Management**: `/api/users/*`

For complete API documentation, see [API Reference](./API_REFERENCE.md).

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```env
MONGODB_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-production-secret-key
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Database Setup
1. Create MongoDB database
2. Run the admin user creation script
3. Configure connection string
4. Set up database indexes

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Structure
- **Components**: Reusable Vue components
- **Pages**: Application pages with routing
- **Composables**: Vue composables for shared logic
- **Server**: Backend API and database models
- **Types**: TypeScript type definitions

### Database Models
- **User**: User accounts and profiles
- **Lead**: Lead information and tracking
- **Activity**: Activity tracking and management
- **Analytics**: Analytics data and metrics

## 🔒 Security

### Authentication
- JWT token-based authentication
- Secure password hashing with bcrypt
- Token expiration and refresh
- Session management

### Authorization
- Role-based access control
- Resource-level permissions
- User-specific data access
- Admin-only operations

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

## 🧪 Testing

### Test Coverage
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Security tests for authentication

### Running Tests
```bash
npm run test         # Run all tests
npm run test:unit    # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:coverage # Run with coverage
```

## 📊 Monitoring

### Logging
- API request logging
- Error tracking and reporting
- User activity logging
- Performance monitoring

### Metrics
- Response times
- Error rates
- User activity metrics
- Database performance

## 🔧 Configuration

### Nuxt Configuration
- Tailwind CSS integration
- Google Fonts
- i18n support
- PWA capabilities
- SEO optimization

### Database Configuration
- MongoDB connection settings
- Mongoose schema configuration
- Index optimization
- Data validation rules

## 🚨 Troubleshooting

### Common Issues
1. **Authentication Errors**: Check JWT token validity and user status
2. **Database Connection**: Verify MongoDB connection string
3. **Permission Denied**: Check user role and permissions
4. **API Errors**: Review server logs and error messages

### Debug Mode
```bash
DEBUG=* npm run dev
```

### Logs
- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Access logs: `logs/access.log`

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Document new features
- Follow conventional commits

### Pull Request Process
1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update version numbers
5. Submit PR with clear description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Check the [documentation](./docs/)
- Review [API Reference](./API_REFERENCE.md)
- Search existing issues
- Create a new issue

### Contact
- **Email**: support@crmleadsai.com
- **Documentation**: [docs/](./docs/)
- **Issues**: GitHub Issues

## 🗺️ Roadmap

### Upcoming Features
- **Advanced AI Features**: Machine learning models for lead prediction
- **Mobile App**: Native mobile application
- **Integration APIs**: Third-party service integrations
- **Advanced Analytics**: Custom reporting and dashboards
- **Workflow Automation**: Automated lead nurturing workflows
- **Multi-tenant Support**: Organization-level data isolation
- **Real-time Notifications**: Push notifications and alerts

### Version History
- **v1.0.0**: Initial release with core CRM features
- **v1.1.0**: AI-powered insights and recommendations
- **v1.2.0**: Advanced analytics and reporting
- **v1.3.0**: User management and RBAC system

---

*This documentation is maintained alongside the codebase and should be updated when features are modified or extended.*
