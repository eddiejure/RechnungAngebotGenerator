# Webdesign CRM - Professional Customer & Project Management

A comprehensive CRM system specifically designed for web design agencies and freelancers. Built with React, TypeScript, Tailwind CSS, and Supabase for real-time data synchronization with advanced project template management.

## 🚀 Features

### Core Modules
- **Dashboard** - Overview of all activities, statistics, and quick actions
- **Lead Management** - Track potential customers through the sales funnel
- **Customer Management** - Complete customer database with contact information
- **Project Management** - Comprehensive project tracking with phases and progress
- **Document Creation** - Professional invoices, quotes, and business letters
- **Template System** - Reusable company, line item, and project type templates
- **Project Templates** - Pre-configured project types with phases, pricing, and features

### Key Capabilities
- **Real-time Synchronization** - All data synced across devices via Supabase
- **Lead to Customer Conversion** - Seamless workflow from lead to paying customer
- **Project-Document Linking** - Connect invoices and quotes to specific projects
- **Payment Models** - Support for one-time payments and subscription-based projects
- **PDF Generation** - Professional German-compliant documents
- **Multi-user Authentication** - Secure user accounts with row-level security
- **Project Automation** - Quick project creation using pre-built templates
- **Phase Management** - Structured project phases with dependencies and deliverables
- **Template Categories** - Organized templates by Web, Design, Marketing, Service categories

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **React PDF** - PDF document generation
- **Tiptap** - Rich text editor for letters

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security** - User data isolation
- **Real-time Subscriptions** - Live data updates
- **Authentication** - Email/password with session management

### File Structure
```
src/
├── components/           # React components
│   ├── AuthWrapper.tsx   # Authentication wrapper
│   ├── Dashboard.tsx     # Main dashboard
│   ├── LeadsList.tsx     # Lead management
│   ├── LeadForm.tsx      # Lead creation/editing
│   ├── CustomersList.tsx # Customer management
│   ├── CustomerForm.tsx  # Customer creation/editing
│   ├── ProjectsList.tsx  # Project overview
│   ├── ProjectForm.tsx   # Project creation/editing
│   ├── ProjectDetails.tsx# Detailed project view
│   ├── DocumentForm.tsx  # Document creation
│   ├── DocumentList.tsx  # Document overview
│   ├── PDFDocument.tsx   # PDF generation
│   ├── TemplateManager.tsx# Template management
│   ├── LineItemForm.tsx  # Line item editing
│   └── RichTextEditor.tsx# Rich text editing for letters
├── lib/
│   └── supabase.ts       # Supabase client configuration
├── types/
│   ├── crm.ts           # CRM-related types
│   ├── document.ts      # Document types
│   ├── template.ts      # Template types
│   └── supabase.ts      # Database types
├── utils/
│   ├── supabaseStorage.ts# Database operations
│   └── calculations.ts   # Business calculations
└── App.tsx              # Main application component
```

## 🗄️ Database Schema

### Core Tables
- **customers** - Customer information and contact details
- **leads** - Potential customers in the sales pipeline
- **projects** - Web design projects with phases and progress
- **documents** - Invoices, quotes, and business letters
- **document_line_items** - Individual items within documents
- **project_phases** - Project phases and milestones
- **project_documents** - Links between projects and documents
- **company_templates** - Reusable company information
- **line_item_templates** - Reusable service items
- **project_type_templates** - Pre-configured project types with settings
- **project_phase_templates** - Reusable project phases with dependencies

### Security
- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - Each user only sees their own data
- **Secure authentication** - Supabase Auth integration

## 🔄 Data Flow

### Lead to Customer Conversion
1. Lead created with contact information and estimated value
2. Lead status tracked through sales pipeline
3. Conversion to customer transfers all data including follow-up dates
4. Lead automatically deleted after successful conversion

### Project Management
1. Projects linked to customers with automatic data population
2. Project phases track progress from briefing to launch
3. Documents can be linked to projects for organization
4. Progress tracking with visual indicators

### Document Creation
1. Select customer from CRM or enter manually
2. Optional project linking for better organization
3. Line items with drag-and-drop reordering
4. Professional PDF generation with German compliance
5. Automatic linking to customer and project records

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Modern web browser

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project and get credentials
4. Configure environment variables in `.env`
5. Run migrations to create database schema
6. Start development server: `npm run dev`

### Environment Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Usage Workflows

### Managing Leads
1. **Create Lead** - Add potential customer information
2. **Track Progress** - Update status through sales pipeline
3. **Schedule Follow-ups** - Set reminder dates
4. **Convert to Customer** - Seamless conversion with data transfer

### Project Management
1. **Create Project** - Link to customer, set budget and timeline
2. **Define Phases** - Break project into manageable phases
3. **Track Progress** - Update completion percentage
4. **Manage Documents** - Link invoices and quotes to projects
5. **Use Templates** - Quick setup with pre-configured project types
6. **Phase Dependencies** - Structured workflow with phase relationships

### Template Management
1. **Project Type Templates** - Create reusable project configurations
2. **Phase Templates** - Define standard project phases
3. **Quick Project Creation** - Select template and auto-populate project data
4. **Category Organization** - Organize templates by Web, Design, Marketing, etc.
5. **Feature Presets** - Pre-configure responsive design, SEO, CMS options
### Document Creation
1. **Choose Type** - Invoice, quote, or business letter
2. **Select Customer** - Use CRM data or enter manually
3. **Add Line Items** - Services with quantities and prices
4. **Generate PDF** - Professional German-compliant documents

## 🔧 Technical Details

### Real-time Features
- **Live Updates** - Changes appear instantly across all devices
- **Conflict Resolution** - Automatic handling of concurrent edits
- **Offline Support** - Basic functionality when offline

### Template System
- **Project Type Templates** - Pre-configured project setups with phases
- **Phase Templates** - Reusable project phases with estimated hours
- **Feature Presets** - Standard configurations for common project types
- **Category Management** - Organized by Web, Design, Marketing, Service
- **Dependency Tracking** - Phase dependencies and deliverables
- **Time Estimation** - Built-in duration and effort estimates
### PDF Generation
- **German Compliance** - Proper formatting for German business documents
- **Professional Layout** - Clean, modern design
- **Automatic Calculations** - VAT, totals, and currency formatting

### Security Features
- **User Authentication** - Secure login with email/password
- **Data Isolation** - Users only see their own data
- **Secure API** - All database operations through Supabase RLS

## 🎯 Business Logic

### Payment Models
- **One-time Payment** - Traditional project billing
- **Monthly Subscription** - Recurring website maintenance
- **Annual Subscription** - Long-term service agreements
- **Setup Fees** - Initial costs for subscription projects

### Project Template Categories
- **Web Development** - Websites, E-Commerce, Landing Pages, Apps
- **Design Services** - Logo Design, Branding, Print Media
- **Marketing Services** - SEO, Social Media, Content Marketing
- **Service Offerings** - Consulting, Maintenance, Hosting, Domains
- **Custom Categories** - User-defined project types and configurations
### Document Types
- **Invoices** - Final billing with due dates
- **Quotes** - Project estimates and proposals  
- **Business Letters** - General correspondence with rich text

### Project Phases
- **Briefing & Concept** - Requirements gathering
- **Design** - Visual design and wireframes
- **Development** - Frontend and backend implementation
- **Content Integration** - Content management and optimization
- **Testing & QA** - Quality assurance and bug fixes
- **Launch** - Go-live and deployment

### Template-Based Project Creation
1. **Select Template** - Choose from pre-configured project types
2. **Auto-Population** - Project details, phases, and settings filled automatically
3. **Customization** - Modify template data to match specific requirements
4. **Phase Dependencies** - Automatic phase ordering and dependency management
5. **Time Estimation** - Built-in duration and effort calculations
6. **Feature Configuration** - Pre-set responsive design, SEO, CMS options

## 🔍 Troubleshooting

### Common Issues
- **Authentication Errors** - Check Supabase credentials
- **Data Not Syncing** - Verify internet connection and RLS policies
- **PDF Generation Issues** - Ensure all required fields are filled

### Performance Optimization
- **Database Indexes** - Optimized queries for large datasets
- **Real-time Subscriptions** - Efficient change detection
- **Component Optimization** - Minimal re-renders with proper state management

## 📈 Future Enhancements

### Planned Features
- **Time Tracking** - Log hours worked on projects
- **Team Collaboration** - Multi-user project management
- **Advanced Reporting** - Business analytics and insights
- **API Integration** - Connect with external tools
- **Mobile App** - Native mobile application
- **Template Marketplace** - Share and import community templates
- **Advanced Dependencies** - Complex phase relationships and conditions
- **Resource Planning** - Team member assignment and capacity planning
- **Template Versioning** - Track and manage template changes over time

### Scalability
- **Multi-tenant Architecture** - Support for agencies with multiple clients
- **Advanced Permissions** - Role-based access control
- **Backup & Recovery** - Automated data backup solutions
- **Template Sharing** - Cross-organization template sharing
- **Bulk Operations** - Mass project creation from templates

## 🤝 Contributing

This is a professional CRM system designed for web design agencies. The codebase follows modern React patterns with TypeScript for type safety and Supabase for reliable data management.

## 📄 License

Professional web design CRM system - All rights reserved.