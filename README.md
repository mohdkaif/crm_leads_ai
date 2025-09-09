# CRM Leads AI

A comprehensive AI-powered CRM Lead Management System built with Nuxt.js, MongoDB, and modern web technologies.

## Features

### 🚀 Core Features
- **Lead Management**: Complete CRUD operations for leads
- **User Management**: Role-based user system with RBAC
- **Analytics Dashboard**: Real-time insights and reporting
- **AI-Powered Insights**: Lead scoring, sentiment analysis, and recommendations
- **Activity Tracking**: Comprehensive activity logging and management
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS

### 🤖 AI Features
- **Lead Scoring**: Automatic lead qualification scoring (0-100)
- **Sentiment Analysis**: Analyze communication sentiment
- **Smart Recommendations**: AI-generated next actions and insights
- **Risk Assessment**: Identify potential issues and opportunities
- **Engagement Tracking**: Monitor lead engagement levels

### 🔐 Security & Access Control
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Admin, Manager, Sales, Viewer roles
- **Permission System**: Granular permissions for different operations
- **Secure API**: Protected endpoints with middleware

### 📊 Analytics & Reporting
- **Dashboard Metrics**: Key performance indicators
- **Lead Analytics**: Status, source, and performance tracking
- **User Performance**: Individual and team metrics
- **Visual Charts**: Interactive data visualization
- **Export Capabilities**: Data export functionality

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching capability
- **Real-time Updates**: Live data synchronization
- **Intuitive Navigation**: User-friendly interface
- **Accessibility**: WCAG compliant design

## Tech Stack

### Frontend
- **Nuxt.js 3**: Vue.js framework with SSR
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **VueUse**: Vue composition utilities
- **Chart.js**: Data visualization
- **Heroicons**: Beautiful SVG icons

### Backend
- **Node.js**: JavaScript runtime
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing

### AI & Analytics
- **Custom AI Service**: Lead scoring and analysis
- **Sentiment Analysis**: Communication analysis
- **Recommendation Engine**: Smart suggestions
- **Analytics Engine**: Performance metrics

## Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 5.0+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crm-leads-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/crm_leads_ai
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   AUTH_ORIGIN=http://localhost:3000
   API_BASE_URL=http://localhost:3000/api
   SITE_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Users
- Authentication and profile information
- Role-based access control
- Activity tracking

### Leads
- Contact information and company details
- Lead status and priority tracking
- AI insights and scoring
- Custom fields and tags

### Activities
- Activity logging and tracking
- Task management
- Communication history
- AI-generated insights

### Analytics
- Performance metrics
- Lead source analysis
- User performance tracking
- Trend analysis

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - List leads with filtering
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get lead details
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/leads` - Lead analytics
- `GET /api/analytics/users` - User performance

### AI Features
- `POST /api/ai/analyze-lead` - Analyze lead with AI
- `GET /api/ai/recommendations` - Get AI recommendations

### Activities
- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity
- `PUT /api/activities/:id` - Update activity

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user

## User Roles & Permissions

### Admin
- Full system access
- User management
- System settings
- All lead operations

### Manager
- Team management
- Lead oversight
- Analytics access
- Limited user management

### Sales
- Own leads only
- Activity management
- Limited analytics
- Profile management

### Viewer
- Read-only access
- Basic analytics
- No modifications

## AI Features Explained

### Lead Scoring
The AI analyzes multiple factors to score leads:
- Email quality and domain
- Company size and industry
- Lead source and engagement
- Response time and budget
- Timeline and urgency

### Sentiment Analysis
Analyzes communication to determine:
- Overall sentiment (positive/neutral/negative)
- Emotional indicators
- Engagement level
- Risk factors

### Smart Recommendations
AI provides actionable insights:
- Next best actions
- Risk mitigation strategies
- Engagement improvement tips
- Priority adjustments

## Development

### Project Structure
```
crm-leads-ai/
├── assets/          # Static assets
├── components/      # Vue components
├── composables/     # Vue composables
├── layouts/         # Layout components
├── middleware/      # Route middleware
├── pages/           # Application pages
├── plugins/         # Nuxt plugins
├── server/          # Server-side code
│   ├── api/         # API routes
│   ├── models/      # Database models
│   ├── middleware/  # Server middleware
│   └── utils/       # Utility functions
├── types/           # TypeScript types
└── nuxt.config.ts  # Nuxt configuration
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- Database connection string
- JWT secret key
- API keys
- Domain configuration

### Database Setup
1. Create MongoDB database
2. Set up indexes for performance
3. Configure backup strategy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## Roadmap

### Upcoming Features
- [ ] Advanced reporting
- [ ] Email integration
- [ ] Calendar synchronization
- [ ] Mobile app
- [ ] Advanced AI features
- [ ] Third-party integrations
- [ ] Workflow automation
- [ ] Advanced analytics

---

Built with ❤️ using Nuxt.js, MongoDB, and AI