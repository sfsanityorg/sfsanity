# SF Sanity

San Francisco event aggregator and filter. Inspired by the former [Arxiv sanity lite](www.arxiv-sanity-lite.com/), [](https://github.com/karpathy/arxiv-sanity-lite) which seems to be offline as of June 2025.

## Sources

<!-- auto-gen-sources-here -->

## Features

- 📊 **Clean Dashboard Interface** - Modern card-based layout with responsive design
- 🔄 **Real-time Database Status** - Live connection monitoring
- 📱 **Mobile Responsive** - Works seamlessly on all device sizes
- ⚡ **Fast Loading** - Optimized for Vercel's free tier
- 🎛️ **Configurable Options** - Toggle infinite scroll functionality
- 🔒 **Enterprise Security** - Comprehensive Row-Level Security (RLS) implementation
- 🛡️ **Data Protection** - Automatic error sanitization and secure logging
- 📋 **Audit Trail** - Complete change tracking and user attribution

## Security Features

### 🔐 Row-Level Security (RLS)
- **Public Read Access**: Anonymous users can view active items
- **Authenticated Operations**: Only logged-in users can create/modify data
- **Owner-Based Permissions**: Users can only edit their own items
- **Service Role Access**: Admin operations for system maintenance
- **Audit Trail**: All changes tracked with user attribution

### 🛡️ Data Protection
- **Environment Variable Validation**: Startup validation prevents runtime errors
- **Secure Error Handling**: Sensitive data automatically sanitized from logs
- **Type-Safe Operations**: Runtime validation with Zod schemas
- **Production Logging**: Structured logging without sensitive data exposure

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL) with RLS
- **Security**: Comprehensive RLS policies, secure logging, data validation
- **Deployment**: Vercel

## Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd supabase-frontend
npm install
\`\`\`

### 2. Environment Setup

Copy the example environment file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Update \`.env.local\` with your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 3. Database Setup

Run the SQL scripts in your Supabase SQL Editor **in order**:

1. **\`scripts/create-sample-table.sql\`** - Creates the items table with RLS
2. **\`scripts/add-more-sample-data.sql\`** - Adds sample data
3. **\`scripts/advanced-rls-policies.sql\`** - (Optional) Advanced security policies
4. **\`scripts/validate-rls-security.sql\`** - (Optional) Validate security setup

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your dashboard.

## Security Configuration

### Required: Basic RLS Setup
The main SQL script automatically enables RLS with these policies:
- ✅ Public read access for all items
- ✅ Authenticated users can insert items
- ✅ Users can update/delete their own items
- ✅ Service role has full access

### Optional: Advanced Security
Run \`scripts/advanced-rls-policies.sql\` for additional features:
- 🕐 Time-based access controls
- 👁️ Status-based visibility rules
- 📊 Rate limiting
- 📝 Comprehensive audit trail

### Security Validation
Run \`scripts/validate-rls-security.sql\` to verify:
- RLS is enabled on all tables
- Policies are correctly configured
- Permissions are properly set
- No security vulnerabilities exist

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - \`SUPABASE_SERVICE_ROLE_KEY\` (optional, for admin operations)
4. Deploy!

Alternatively, use the Vercel CLI:

\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

## Configuration

### Environment Variables

| Variable | Description | Required | Security Level |
|----------|-------------|----------|----------------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | Your Supabase project URL | Yes | Public |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Supabase anonymous key | Yes | Public |
| \`SUPABASE_SERVICE_ROLE_KEY\` | Service role key (server-side) | No | Server-only |

### Database Schema

The application expects an \`items\` table with RLS enabled:

\`\`\`sql
CREATE TABLE public.items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- RLS is automatically enabled by our scripts
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
\`\`\`

## Usage

- **View Items**: The dashboard displays up to 25 items from your database
- **Monitor Status**: Check database connection status in the Status card
- **Toggle Options**: Use the infinite scroll checkbox (functionality coming soon)
- **Security**: All operations respect RLS policies automatically

## Development

### Project Structure

\`\`\`
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── layout.tsx        # Root layout with error boundaries
│   └── api/              # API routes with secure error handling
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── error-boundary.tsx # React error boundaries
│   ├── error-display.tsx  # User-friendly error display
│   └── database-status.tsx # Real-time connection status
├── lib/
│   ├── supabase.ts       # Supabase client configuration
│   ├── error-handler.ts  # Structured error handling
│   ├── secure-logger.ts  # Safe logging utility
│   └── env.ts           # Environment validation
├── scripts/
│   ├── create-sample-table.sql    # Main table creation with RLS
│   ├── add-more-sample-data.sql   # Sample data
│   ├── advanced-rls-policies.sql  # Advanced security policies
│   └── validate-rls-security.sql  # Security validation
├── docs/
│   └── SECURITY.md       # Comprehensive security guide
└── README.md
\`\`\`

### Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

## Security

This application implements enterprise-grade security measures:

- **Row-Level Security (RLS)**: All database access controlled by policies
- **Data Validation**: Runtime validation with Zod schemas
- **Secure Logging**: Automatic sanitization of sensitive data
- **Error Handling**: User-friendly messages without technical details
- **Environment Validation**: Startup checks prevent configuration errors
- **Audit Trail**: Complete change tracking for compliance

For detailed security information, see [docs/SECURITY.md](docs/SECURITY.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including security tests)
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the [GitHub Issues](link-to-issues)
- Review the [Security Guide](docs/SECURITY.md)
- Visit [Supabase Documentation](https://supabase.com/docs)
- Check [Next.js Documentation](https://nextjs.org/docs)

## Security Reporting

If you discover a security vulnerability, please email [security@yourcompany.com] instead of opening a public issue.
